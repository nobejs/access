const validator = requireValidator();
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "type",
    "value",
    "token",
    "after_verification",
  ]);
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

const respond = ({ prepareResult, handleResult }) => {
  // return handleResult;
  if (prepareResult.after_verification === "respond_with_token") {
    return handleResult;
  }

  return {
    message: "Verification Successful",
    qrCodeUrl: handleResult.qrCodeUrl,
  };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
