const findKeysFromRequest = requireUtil("findKeysFromRequest");
const speakeasy = require("speakeasy");
const attributesRepo = requireRepo("attributes");
const usersRepo = requireRepo("users");
const mfaRepo = requireRepo("mfa");
const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["authCode", "userUuid"]);
  return payload;
};

const authorize = async ({ prepareResult }) => {
  return true;
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    const isValid = await mfaRepo.verifyMfaCode(prepareResult);
    return isValid;
  } catch (error) {
    console.log(error);
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
