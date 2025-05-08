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

const validateInput = async (payload) => {
  const constraints = {
    token: {
      presence: {
        allowEmpty: false,
        message: "^Please provide token",
      },
    },
    type: {
      presence: {
        allowEmpty: false,
        message: "^Please choose type",
      },
      inclusion: {
        within: usersRepo.getAllowedTypes(),
        message: "^Please choose valid type",
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
              ? await verificationsRepo.findVerificationForLogin({
                  attribute_value: payload.value?.toLowerCase(),
                  attribute_type: payload.type,
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
    return await usersRepo.authenticateWithOTP(inputPayload);
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
