const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const {
  getAuthorizationUrl,
  getAuthenticatedUser,
} = requireFunction("microsoftClient");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "redirect_to",
    "redirect_uri",
    "state",
    "id_token",
    "access_token",
  ]);
  return payload;
};

const authorize = async () => {
  return true;
};

const handle = async ({ prepareResult }) => {
  try {
    // Fallback flow used by cmihub BFF: app exchanges code and posts tokens here.
    if (prepareResult.id_token || prepareResult.access_token) {
      const userObject = await getAuthenticatedUser({
        access_token: prepareResult.access_token,
        id_token: prepareResult.id_token,
      });
      const token = await usersRepo.registerUserFromGoogle(userObject);
      return { access_token: token };
    }

    const authorizeUrl = await getAuthorizationUrl(prepareResult);
    return { microsoft_authorization_url: authorizeUrl };
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  return handleResult;
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
