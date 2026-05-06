const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const {
  exchangeCodeForTokens,
  getAuthenticatedUser,
} = requireFunction("microsoftClient");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "code",
    "redirect_to",
    "redirect_uri",
    "state",
  ]);
  return payload;
};

const authorize = async () => {
  return true;
};

const handle = async ({ prepareResult }) => {
  try {
    const microsoftTokens = await exchangeCodeForTokens(prepareResult);
    const userObject = await getAuthenticatedUser({
      access_token: microsoftTokens.access_token,
      id_token: microsoftTokens.id_token,
    });
    const token = await usersRepo.registerUserFromGoogle(userObject);

    return { token, idToken: microsoftTokens.id_token };
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult, res }) => {
  try {
    if (prepareResult.state === "redirect_with_token") {
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult.token}&id_token=${handleResult.idToken}&platform=microsoft`;
      return res.redirect(redirectWithTokenUrl);
    }

    return {
      access_token: handleResult.token,
      id_token: handleResult.idToken,
    };
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
