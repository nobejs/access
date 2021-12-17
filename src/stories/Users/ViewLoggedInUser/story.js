const tokensRepo = requireRepo("tokens");
const usersRepo = requireRepo("users");
const UserSerializer = requireSerializer("user");

const prepare = ({ reqQuery, reqBody, reqParams }) => {
  // Read the token
  return {};
};

const authorize = async ({ prepareResult }) => {
  // Middleware might have checked - jti, exp
  // Just take the sub and return the user
  // Check if issuer is user

  try {
    let token = await tokensRepo.first({ uuid: prepareResult.jti });
    if (token["issuer"] === "user") {
      return token;
    } else {
      throw {
        statusCode: 401,
        message: "Unauthorized",
      };
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
