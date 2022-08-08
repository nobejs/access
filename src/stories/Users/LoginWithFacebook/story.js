const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const facebookClient = require("../../../functions/facebookClient");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["code", "redirect_to", "state"]);
  return payload;
};

const authorize = async ({ prepareResult }) => {
  try {
    if (0) {
      throw {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    const payload = {
      clientID: process.env.FACEBOOK_APP_ID,
      grant_type: "authorization_code",
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      redirectUri:
        prepareResult.redirect_to || process.env.FACEBOOK_REDIRECT_URL,
      code: prepareResult.code,
    };

    const tokenResponse = await facebookClient.getAccessToken(payload);
    console.log("tokenResponse::>>", tokenResponse.access_token);
    const res = await facebookClient.getAuthenticatedUser({
      access_token: tokenResponse.access_token,
    });

    console.log("check here user res::>>", res);

    let userObject = {};

    if (res.email) {
      userObject["email"] = res.email;
    }

    if (res.name) {
      userObject["name"] = res.name;
    }

    let token = await usersRepo.registerUserFromGoogle(userObject);

    return token;
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult, res }) => {
  try {
    if (prepareResult.state === "redirect_with_token") {
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult}&platform=facebook`;
      return res.redirect(redirectWithTokenUrl);
    }

    return { access_token: handleResult };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
