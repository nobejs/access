const findKeysFromRequest = requireUtil("findKeysFromRequest");
const facebookClient = require("../../../functions/facebookClient");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, [
    "redirect_to",
    "state",
    "response_type",
  ]);
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
      responseType: prepareResult.response_type || "code",
      clientID: process.env.FACEBOOK_APP_ID,
      redirectUri:
        prepareResult.redirect_to || process.env.FACEBOOK_REDIRECT_URL,
      state: prepareResult.state || "respond_with_token",
      scope: process.env.FACEBOOK_SCOPES,
    };
    // if user has denied permission and wants to allow again
    // if (prepareResult.rerequest_permission) {
    //   options["auth_type"] = "rerequest";
    // }

    const authorizationUrl = await facebookClient.getAuthorizationUrl(options);

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
