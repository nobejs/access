const findKeysFromRequest = requireUtil("findKeysFromRequest");
const linkedinClient = require("../../../functions/linkedinClient");

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
      clientID: process.env.LINKEDIN_CLIENT_ID,
      redirectUri:
        prepareResult.redirect_to || process.env.LINKEDIN_REDIRECT_URL,
      state: prepareResult.state || "respond_with_token",
      scope: process.env.LINKEDIN_SCOPES,
    };

    const authorizationUrl = await linkedinClient.getAuthorizationUrl(options);

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
