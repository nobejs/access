const findKeysFromRequest = requireUtil("findKeysFromRequest");
const { OAuth2Client } = require("google-auth-library");
const usersRepo = requireRepo("users");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["code", "redirect_to", "state"]);
  // console.log("payload", payload);
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

    const r = await oAuth2Client.getToken(prepareResult.code);
    oAuth2Client.setCredentials(r.tokens);

    const url =
      "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses";
    const res = await oAuth2Client.request({ url });

    let userObject = {};

    if (res.data.names.length) {
      userObject["name"] = res.data.names[0]["displayName"];
    }

    if (res.data.emailAddresses.length) {
      userObject["email"] = res.data.emailAddresses[0]["value"];
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
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult}&platform=google`;
      // console.log("redirectWithTokenUrl", redirectWithTokenUrl);
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
