const findKeysFromRequest = requireUtil("findKeysFromRequest");
const { OAuth2Client } = require("google-auth-library");
const usersRepo = requireRepo("users");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["id_token"]);
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

    const verifiedToken = await oAuth2Client.verifyIdToken({
      idToken: prepareResult.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const res = verifiedToken.getPayload();

    let userObject = {};

    if (res.name) {
      userObject["name"] = res.name;
    }

    if (res.email) {
      userObject["email"] = res.email;
    }

    let token = await usersRepo.registerUserFromGoogle(userObject);

    return token;
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult, res }) => {
  try {
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
