const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const linkedinClient = require("../../../functions/linkedinClient");

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
      clientID: process.env.LINKEDIN_CLIENT_ID,
      grant_type: "authorization_code",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      redirectUri:
        prepareResult.redirect_to || process.env.LINKEDIN_REDIRECT_URL,
      code: prepareResult.code,
    };

    const tokenResponse = await linkedinClient.getAccessToken(payload);

    const res = await linkedinClient.getAuthenticatedUser({
      access_token: tokenResponse.access_token,
    });

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
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult}&platform=linkedin`;
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
