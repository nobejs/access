const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const { getAccessToken, getAuthenticatedUser } = requireFunction("oktaClient");

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
    const oktaAccessToken = await getAccessToken(prepareResult);
    console.log("token:>", oktaAccessToken);
    const userInfo = await getAuthenticatedUser(oktaAccessToken);
    console.log("userifo:>", userInfo);
    const oktaIdToken = oktaAccessToken.id_token;

    let userObject = {};

    if (userInfo.name) {
      userObject["name"] = userInfo.name;
    }

    if (userInfo.email) {
      userObject["email"] = userInfo.email;
    }

    let token = await usersRepo.registerUserFromGoogle(userObject);

    return { token, oktaIdToken };
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult, res }) => {
  try {
    if (prepareResult.state === "redirect_with_token") {
      const redirectWithTokenUrl = `${process.env.OKTA_REDIRECT_URL}?access_token=${handleResult.token}&id_token=${oktaIdToken}&platform=okta`;
      return res.redirect(redirectWithTokenUrl);
    }

    return { access_token: handleResult.token, id_token: oktaIdToken };
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
