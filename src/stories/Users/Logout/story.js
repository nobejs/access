const tokensRepo = requireRepo("tokens");

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

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    return tokensRepo.deleteTokenByConstraints({
      uuid: prepareResult.jti,
    });
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return {
      message: "Successfully logged out",
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
