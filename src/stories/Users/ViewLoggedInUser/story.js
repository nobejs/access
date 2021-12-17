const tokensRepo = requireRepo("tokens");
const usersRepo = requireRepo("users");
const UserSerializer = requireSerializer("user");

const prepare = ({ req }) => {
  return {
    jti: req.jti,
  };
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
      let token = await tokensRepo.first({ uuid: prepareResult.jti });
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

const handle = async ({ authorizeResult }) => {
  try {
    return await usersRepo.first({ uuid: authorizeResult.sub });
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
