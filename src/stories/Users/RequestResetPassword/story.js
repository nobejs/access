const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();
const attributesRepo = requireRepo("attributes");
const usersRepo = requireRepo("users");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "type",
    "value",
    "verification_method",
  ]);
  payload["verification_method"] = payload["verification_method"]
    ? payload["verification_method"]
    : "otp";
  return payload;
};

const authorize = ({ prepareResult }) => {
  // Anyone can request to verify an attribute
  return true;
};

const validateInput = async (payload) => {
  const constraints = {
    verification_method: {
      presence: {
        allowEmpty: false,
        message: "^Please choose verification_method",
      },
      inclusion: {
        within: usersRepo.getAllowedVerificationMethods(),
        message: "^Please choose valid type",
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
          let userCount =
            typeof payload.value === "string"
              ? await usersRepo.findUserByTypeAndValue({
                  value: payload.value,
                  type: payload.type,
                })
              : -1;
          return userCount > 0 ? true : false;
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
    await usersRepo.requestAttributeVerificationForResetPassword(inputPayload);
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
