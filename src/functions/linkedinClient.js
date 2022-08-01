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
    let authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=${data.response_type}&client_id=${data.client_id}&redirect_uri=${data.redirect_uri}&state=${data.state}&scope=${data.scope}`;

    return authorizationUrl;
  } catch (error) {
    console.log("error", error);
  }
};

const getAccessToken = async (payload) => {
  let linkedInEndpoints = `https://www.linkedin.com/oauth/v2/accessToken`;
  let data = {
    grant_type: "authorization_code",
    code: payload.code,
    client_id: payload.clientID,
    client_secret: payload.clientSecret,
    redirect_uri: payload.redirectUri,
  };
  try {
    const res = await axios({
      method: "post",
      url: linkedInEndpoints,
      params: data,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return res.data;
  } catch (error) {
    console.log("error", error);
  }
};

const getAuthenticatedUser = async (payload) => {
  let linkedInEndpoints = `https://api.linkedin.com/v2/me`;

  try {
    let data = {};
    const profileRes = await axios({
      method: "get",
      url: linkedInEndpoints,
      headers: { Authorization: `Bearer ${payload.access_token}` },
    });

    if (profileRes.data.localizedFirstName) {
      data["name"] = profileRes.data.localizedFirstName;
    }

    if (profileRes.data.localizedLastName) {
      data["name"] = `${data.name} ${profileRes.data.localizedLastName}`;
    }

    const contactRes = await axios({
      method: "get",
      url: "https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))",
      headers: { Authorization: `Bearer ${payload.access_token}` },
    });

    if (contactRes.data.elements.length > 0) {
      let emailObject = contactRes.data.elements[0];
      if (emailObject["handle~"].emailAddress) {
        data["email"] = emailObject["handle~"].emailAddress;
      }
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
