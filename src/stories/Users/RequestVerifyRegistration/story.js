const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "type",
    "value",
    "verification_method",
    "success_redirect",
    "failure_redirect",
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

  if (payload.verification_method && payload.verification_method === "link") {
    const success_redirect = {
      presence: {
        allowEmpty: true,
        message: "^Please enter success_redirect",
      },
      url: true,
    };

    const failure_redirect = {
      presence: {
        allowEmpty: true,
        message: "^Please enter failure_redirect",
      },
      url: true,
    };

    constraints["success_redirect"] = success_redirect;
    constraints["failure_redirect"] = failure_redirect;
  }

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
