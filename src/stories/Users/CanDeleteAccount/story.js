const attributesRepo = requireRepo("attributes");
const tokensRepo = requireRepo("tokens");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  return {
    jti: req.jti,
  };
};

const authorize = async ({ prepareResult }) => {
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
    await attributesRepo.deleteAccount({
      user_uuid: authorizeResult.sub,
    });

    await tokensRepo.deleteTokenByConstraints({
      sub: authorizeResult.sub,
      issuer: "user",
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
