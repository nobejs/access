const validator = requireValidator();
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["type", "value", "token"]);
  return payload;
};

const authorize = ({ prepareResult }) => {
  return true;
};

const handle = async ({ prepareResult }) => {
  try {
    return await usersRepo.verifyAttributeForRegistrationUsingOTP(
      prepareResult
    );
  } catch (error) {
    throw error;
  }
};

const respond = ({ handleResult }) => {
  return { access_token: handleResult };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
