const tokensRepo = requireRepo("tokens");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["session_uuid"]);

  return {
    sub: req.sub,
    jti: req.jti,
    issuer: req.issuer,
    session_uuid: payload.session_uuid,
  };
};

const authorize = async ({ prepareResult }) => {
  try {
    if (prepareResult.issuer !== "user") {
      throw {
        statusCode: 403,
        message: "Forbidden 1",
      };
    }

    if (prepareResult.jti === prepareResult.session_uuid) {
      throw {
        statusCode: 403,
        message: "Forbidden 2",
      };
    }

    let currentToken = await tokensRepo.first({ uuid: prepareResult.jti });
    let sessionToken = await tokensRepo.first({
      uuid: prepareResult.session_uuid,
    });

    if (currentToken.sub !== sessionToken.sub) {
      throw {
        statusCode: 403,
        message: "Forbidden 3",
      };
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult }) => {
  try {
    return tokensRepo.deleteTokenByConstraints({
      uuid: prepareResult.session_uuid,
    });
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return {
      message: "Successfully deleted",
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
