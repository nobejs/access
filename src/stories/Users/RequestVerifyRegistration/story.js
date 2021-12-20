const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["type", "value"]);
  return payload;
};

const authorize = ({ prepareResult }) => {
  // Anyone can request to verify an attribute
  return true;
};

const validateInput = async (payload) => {
  const constraints = {
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
        message: "Value should be unique",
        callback: async (payload) => {
          let verification =
            typeof payload.value === "string"
              ? await verificationsRepo.findVerificationForRegistration({
                  attribute_value: payload.value,
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

const handle = async ({ prepareResult }) => {
  try {
    let inputPayload = prepareResult;
    await validateInput(inputPayload);
    await usersRepo.requestAttributeVerificationForRegistration(inputPayload);
  } catch (error) {
    throw error;
  }
};

const respond = () => {
  return {
    message: "Request for verification successfully",
  };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
