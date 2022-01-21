const findKeysFromRequest = requireUtil("findKeysFromRequest");
const { OAuth2Client } = require("google-auth-library");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["redirect_to"]);
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
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      prepareResult.redirect_to || process.env.GOOGLE_REDIRECT_URL
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      // access_type: "offline",
      scope: process.env.GOOGLE_SCOPES.split(","),
    });

    return { redirect_to: authorizeUrl };
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
