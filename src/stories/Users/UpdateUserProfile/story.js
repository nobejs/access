const tokensRepo = requireRepo("tokens");
const usersRepo = requireRepo("users");
const UserSerializer = requireSerializer("user");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "timezone",
    "name",
    "profile_picture",
    "bio",
  ]);
  payload["jti"] = req.jti;
  return payload;
};

const authorize = async ({ prepareResult }) => {
  // Middleware might have checked - jti, exp
  // Just take the sub and return the user
  // Check if issuer is user

  let unauthorizedObject = {
    statusCode: 401,
    message: "Unauthorized",
  };

  try {
    if (prepareResult.jti !== undefined) {
      let token = await tokensRepo.first({
        uuid: prepareResult.jti,
      });
      if (token["issuer"] === "user") {
        return token;
      } else {
        throw unauthorizedObject;
      }
    } else {
      throw unauthorizedObject;
    }
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    const userProfile = pickKeysFromObject(prepareResult, [
      "timezone",
      "name",
      "profile_picture",
      "bio",
    ]);
    return await usersRepo.updateProfileOfUser(
      authorizeResult.sub,
      userProfile
    );
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  return await UserSerializer.single(handleResult);
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
