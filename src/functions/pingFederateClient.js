const axios = require("axios");
const { createRemoteJWKSet, jwtVerify } = require("jose");

const pingFederateHttpClient = axios.create({
  timeout: 4000,
});

const CONFIGURATION_ERROR = {
  statusCode: 500,
  message: "PingFederate OIDC configuration is incomplete",
};
const DISCOVERY_ERROR = {
  statusCode: 502,
  message: "PingFederate OIDC discovery failed",
};
const TOKEN_ERROR = {
  statusCode: 502,
  message: "PingFederate token exchange failed",
};
const IDENTITY_TOKEN_ERROR = {
  statusCode: 401,
  message: "Invalid PingFederate identity token",
};

let discoveryPromise;

const getPingFederateConfig = () => {
  const issuerValue = process.env.PINGFEDERATE_ISSUER_URL;
  const clientId = process.env.PINGFEDERATE_CLIENT_ID;
  const clientSecret = process.env.PINGFEDERATE_CLIENT_SECRET;
  const redirectUri = process.env.PINGFEDERATE_REDIRECT_URL;

  if (
    !issuerValue?.trim() ||
    !clientId?.trim() ||
    !clientSecret?.trim() ||
    !redirectUri?.trim()
  ) {
    throw CONFIGURATION_ERROR;
  }

  return {
    issuer: issuerValue,
    clientId,
    clientSecret,
    redirectUri,
  };
};

const validateDiscoveryEndpoint = (endpoint, issuerOrigin) => {
  if (typeof endpoint !== "string" || !endpoint) {
    throw DISCOVERY_ERROR;
  }

  let parsedEndpoint;
  try {
    parsedEndpoint = new URL(endpoint);
  } catch (error) {
    throw DISCOVERY_ERROR;
  }

  if (
    parsedEndpoint.protocol !== "https:" ||
    parsedEndpoint.origin !== issuerOrigin
  ) {
    throw DISCOVERY_ERROR;
  }
};

const validateDiscoveryMetadata = (metadata, config) => {
  if (!metadata || metadata.issuer !== config.issuer) {
    throw DISCOVERY_ERROR;
  }

  const issuerOrigin = new URL(config.issuer).origin;
  [
    "authorization_endpoint",
    "token_endpoint",
    "jwks_uri",
  ].forEach((key) => validateDiscoveryEndpoint(metadata[key], issuerOrigin));

  return metadata;
};

const getDiscoveryMetadata = async (config) => {
  if (!discoveryPromise) {
    const discoveryUrl = `${config.issuer}/.well-known/openid-configuration`;
    discoveryPromise = pingFederateHttpClient
      .get(discoveryUrl)
      .then((response) => validateDiscoveryMetadata(response.data, config))
      .catch(() => {
        discoveryPromise = undefined;
        throw DISCOVERY_ERROR;
      });
  }

  return discoveryPromise;
};

const getAuthorizationUrl = async (payload = {}) => {
  if (typeof payload.state !== "string" || !payload.state.trim()) {
    throw {
      statusCode: 422,
      message: "PingFederate state is required",
    };
  }

  const config = getPingFederateConfig();
  const metadata = await getDiscoveryMetadata(config);
  const authorizationUrl = new URL(metadata.authorization_endpoint);
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    response_mode: "query",
    redirect_uri: config.redirectUri,
    scope: "openid profile email",
    state: payload.state,
  }).toString();

  return authorizationUrl.toString();
};

const exchangeCodeForIdToken = async (code) => {
  const config = getPingFederateConfig();
  const metadata = await getDiscoveryMetadata(config);
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  let response;
  try {
    response = await pingFederateHttpClient.post(
      metadata.token_endpoint,
      form.toString(),
      { headers }
    );
  } catch (error) {
    throw TOKEN_ERROR;
  }

  if (!response.data?.id_token) {
    throw TOKEN_ERROR;
  }

  return response.data.id_token;
};

const verifyIdToken = async (idToken, metadata, config) => {
  let payload;
  try {
    ({ payload } = await jwtVerify(
      idToken,
      createRemoteJWKSet(new URL(metadata.jwks_uri)),
      {
        issuer: config.issuer,
        audience: config.clientId,
        algorithms: metadata.id_token_signing_alg_values_supported,
      }
    ));
  } catch (error) {
    throw IDENTITY_TOKEN_ERROR;
  }

  if (
    typeof payload.exp !== "number" ||
    typeof payload.sub !== "string" ||
    !payload.sub.trim()
  ) {
    throw IDENTITY_TOKEN_ERROR;
  }

  return payload;
};

const getAuthenticatedUser = async (idToken) => {
  const config = getPingFederateConfig();
  const metadata = await getDiscoveryMetadata(config);
  const claims = await verifyIdToken(idToken, metadata, config);

  return {
    email: claims.email.trim().toLowerCase(),
    name: claims.name.trim(),
  };
};

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForIdToken,
  getAuthenticatedUser,
};
