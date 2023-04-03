const findKeysFromRequest = requireUtil("findKeysFromRequest");
const mfaRepo = requireRepo("mfa");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["enableMfa"]);
  console.log(req["jti"]);
  console.log(payload);

  return payload;
};

const authorize = async ({ prepareResult }) => {
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
    const qrData = mfaRepo.gennerateQrCodeUrl(authorizeResult.sub);
    return { qrCodeUrl: qrData.qrCodeUrl };
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
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
