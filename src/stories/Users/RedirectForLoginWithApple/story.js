const findKeysFromRequest = requireUtil("findKeysFromRequest");
const appleSignin = require("apple-signin-auth");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["redirect_to", "state"]);
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
    const options = {
      clientID: process.env.APPLE_CLIENT_ID,
      redirectUri: prepareResult.redirect_to || process.env.APPLE_REDIRECT_URL,
      state: prepareResult.state || "respond_with_token",
      scope: process.env.APPLE_SCOPES.split(",").join(" "),
    };

    const authorizationUrl = appleSignin.getAuthorizationUrl(options);
    return { redirect_to: authorizationUrl };
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return handleResult;
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
