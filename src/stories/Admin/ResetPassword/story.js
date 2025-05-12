const validator = requireValidator();
const adminRepo = requireRepo("admin");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const verificationsRepo = requireRepo("verifications");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["value", "token", "password"]);
  return payload;
};

const authorize = async ({ prepareResult }) => {
  return true;
};

const validateInput = async (payload) => {
  const constraints = {
    password: {
      presence: {
        allowEmpty: false,
        message: "^Please choose password",
      },
    },
    value: {
      presence: {
        allowEmpty: false,
        message: "^Please enter value",
      },
      type: "string",
      custom_callback: {
        message: "User doesn't exist",
        callback: async (payload) => {
          let verification =
            typeof payload.value === "string"
              ? await verificationsRepo.findVerificationForResetPassword({
                  attribute_value: payload.value?.toLowerCase(),
                  attribute_type: "email",
                })
              : -1;
          return verification !== undefined ? true : false;
        },
      },
    },
  };

  return validator(payload, constraints);
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let inputPayload = prepareResult;
    await validateInput(inputPayload);
    return await adminRepo.verifyAttributeForResetPassword(inputPayload);
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
