const axios = require("axios");

const getAuthorizationUrl = async (payload) => {
  console.log("process.env.OKTA_SCOPES", process.env.OKTA_SCOPES, payload);

  try {
    let authorizationUrl = `https://${
      process.env.OKTA_DOMAIN
    }/oauth2/default/v1/authorize?response_type=code&client_id=${
      process.env.OKTA_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      payload.redirect_to || process.env.OKTA_REDIRECT_URL
    )}&scope=${encodeURIComponent(
      process.env.OKTA_SCOPES.replaceAll(",", " ")
    )}&state=${payload.state || "respond_with_token"}`;

    return authorizationUrl;
  } catch (error) {
    console.log("error", error);
  }
};

const getAccessToken = async (payload) => {
  const encodedCredentials = Buffer.from(
    `${process.env.OKTA_CLIENT_ID}:${process.env.OKTA_CLIENT_SECRET}`
  ).toString("base64");

  let oktaEndpoint = `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/token?grant_type=authorization_code&redirect_uri=${payload.redirect_to}&code=${payload.code}`;

  try {
    const res = await axios({
      method: "post",
      url: oktaEndpoint,
      headers: {
        accept: "application/json",
        authorization: `Basic ${encodedCredentials}`,
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    return res.data;
  } catch (error) {
    console.log("error", error);
  }
};

const getAuthenticatedUser = async (payload) => {
  let oktaEndpoint = `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`;

  try {
    const profileRes = await axios({
      method: "get",
      url: oktaEndpoint,
      headers: {
        Authorization: `Bearer ${payload.access_token}`,
      },
    });

    const data = profileRes.data;
    return data;
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  getAuthenticatedUser,
};
