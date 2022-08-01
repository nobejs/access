const axios = require("axios");

const getAuthorizationUrl = async (payload) => {
  let data = {
    response_type: payload.responseType,
    client_id: payload.clientID,
    redirect_uri: payload.redirectUri,
    state: payload.state,
    scope: payload.scope,
  };

  try {
    let authorizationUrl = `https://www.facebook.com/v14.0/dialog/oauth?response_type=${data.response_type}&client_id=${data.client_id}&redirect_uri=${data.redirect_uri}&state=${data.state}&scope=${data.scope}`;

    return authorizationUrl;
  } catch (error) {
    console.log("error", error);
  }
};

const getAccessToken = async (payload) => {
  let facebookEndpoint = `https://graph.facebook.com/v14.0/oauth/access_token?`;
  let data = {
    code: payload.code,
    client_id: payload.clientID,
    client_secret: payload.clientSecret,
    redirect_uri: payload.redirectUri,
  };
  try {
    const res = await axios({
      method: "get",
      url: facebookEndpoint,
      params: data,
    });

    return res.data;
  } catch (error) {
    console.log("error", error);
  }
};

const getAuthenticatedUser = async (payload) => {
  let facebookEndpoint = `https://graph.facebook.com/v14.0/me?id%2Cname%2Cemail&access_token=${payload.access_token}`;

  try {
    let data = {};
    const profileRes = await axios({
      method: "get",
      url: facebookEndpoint,
    });

    console.log("profileRes::>", profileRes);
    if (profileRes.data.name) {
      data["name"] = profileRes.data.name;
    }

    if (profileRes.data.email) {
      data["email"] = profileRes.data.email;
    }

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
