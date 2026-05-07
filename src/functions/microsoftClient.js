const axios = require("axios");
const jwtDecode = require("jwt-decode");

const MICROSOFT_HTTP_TIMEOUT_MS = 3000;
const microsoftHttpClient = axios.create({
  timeout: MICROSOFT_HTTP_TIMEOUT_MS,
});

const getAllowedMicrosoftDomains = () => {
  const raw = process.env.MICROSOFT_ALLOWED_EMAIL_DOMAINS || "";
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
};

const enforceAllowedMicrosoftEmailDomain = (email) => {
  const allowedDomains = getAllowedMicrosoftDomains();
  if (!allowedDomains.length) {
    return;
  }

  const normalizedEmail = (email || "").trim().toLowerCase();
  const domain = normalizedEmail.includes("@")
    ? normalizedEmail.split("@").pop()
    : "";
  if (!domain || !allowedDomains.includes(domain)) {
    throw {
      statusCode: 403,
      message: "Email domain is not allowed",
    };
  }
};

const getAuthorizationUrl = async (payload = {}) => {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri =
    payload.redirect_to ||
    payload.redirect_uri ||
    process.env.MICROSOFT_REDIRECT_URL;
  const scopes = (
    process.env.MICROSOFT_SCOPES || "openid profile email User.Read"
  )
    .split(",")
    .join(" ");

  if (!tenantId || !clientId || !redirectUri) {
    throw {
      statusCode: 500,
      message:
        "Microsoft SSO env is incomplete (MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_REDIRECT_URL)",
    };
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: scopes,
    state: payload.state || "respond_with_token",
  });

  // return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
};

const exchangeCodeForTokens = async (payload = {}) => {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri =
    payload.redirect_to ||
    payload.redirect_uri ||
    process.env.MICROSOFT_REDIRECT_URL;

  if (!tenantId || !clientId || !clientSecret || !redirectUri) {
    throw {
      statusCode: 500,
      message:
        "Microsoft SSO env is incomplete (MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REDIRECT_URL)",
    };
  }

  // const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenEndpoint = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code: payload.code,
    redirect_uri: redirectUri,
  });

  const res = await microsoftHttpClient.post(tokenEndpoint, form.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });

  return res.data;
};

const getAuthenticatedUser = async ({ access_token, id_token }) => {
  let idPayload = null;
  if (id_token) {
    try {
      idPayload = jwtDecode(id_token);
    } catch (error) {
      idPayload = null;
    }
  }

  // Fast path: most tenants include usable identity claims in id_token.
  const idTokenEmail = idPayload?.email || idPayload?.preferred_username;
  const idTokenName = idPayload?.name || "";
  if (idTokenEmail) {
    return {
      email: idTokenEmail.toLowerCase(),
      name: idTokenName,
    };
  }

  let graphUser = null;
  if (access_token) {
    try {
      const profileRes = await microsoftHttpClient.get(
        "https://graph.microsoft.com/v1.0/me?$select=displayName,givenName,surname,userPrincipalName,mail",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      graphUser = profileRes.data;
    } catch (error) {
      graphUser = null;
    }
  }

  const email = graphUser?.mail || graphUser?.userPrincipalName;

  const name =
    graphUser?.displayName ||
    [graphUser?.givenName, graphUser?.surname].filter(Boolean).join(" ");

  if (!email) {
    throw {
      statusCode: 422,
      message: "Could not resolve email from Microsoft profile",
    };
  }

  return {
    email: email.toLowerCase(),
    name: name || "",
  };
};

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getAuthenticatedUser,
  enforceAllowedMicrosoftEmailDomain,
};
