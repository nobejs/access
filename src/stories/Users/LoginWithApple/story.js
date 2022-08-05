const findKeysFromRequest = requireUtil("findKeysFromRequest");
const appleSignin = require("apple-signin-auth");
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
    const clientSecret = appleSignin.getClientSecret({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      privateKey: process.env.APPLE_CLIENT_SECRET.replace(/\\n/g, "\n"),
      keyIdentifier: process.env.APPLE_KEY_IDENTIFIER,
    });

    const options = {
      clientID: process.env.APPLE_CLIENT_ID,
      redirectUri: prepareResult.redirect_to || process.env.APPLE_REDIRECT_URL,
      clientSecret: clientSecret,
    };

    const tokenResponse = await appleSignin.getAuthorizationToken(
      prepareResult.code,
      options
    );
    // console.log("check tokenResponse ", tokenResponse);
    const res = await appleSignin.verifyIdToken(tokenResponse.id_token);
    // console.log("check res", res);

    let userObject = {};

    if (res.email) {
      userObject["email"] = res.email;
    }

    if (res.name) {
      userObject["name"] = res.name;
    }

    let token = await usersRepo.registerUserFromGoogle(userObject); //  change this name to registerUserFromSocialLogins

    return token;
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult, res }) => {
  try {
    if (prepareResult.state === "redirect_with_token") {
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult}`;
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
