const tokensRepo = requireRepo("tokens");

const prepare = ({ req }) => {
  return {
    sub: req.sub,
    issuer: req.issuer,
  };
};

const authorize = async ({ prepareResult }) => {
  try {
    if (prepareResult.issuer !== "user") {
      throw {
        statusCode: 403,
        message: "Forbidden",
      };
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult }) => {
  try {
    return await tokensRepo.findAllUserTokens(prepareResult.sub);
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    console.log("handleResult", handleResult);
    return handleResult;
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
