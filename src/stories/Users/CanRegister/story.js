const validator = requireValidator();
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "type",
    "value",
    "password",
    "verification_method",
    "success_redirect",
    "failure_redirect",
    "meta",
  ]);

  if (payload.type === "email") {
    payload["value"] = payload.value.trim().toLowerCase();
  }
  payload["verification_method"] = payload["verification_method"]
    ? payload["verification_method"]
    : "otp";
  return payload;
};

const authorize = () => {
  // Anyone can access this endpoint
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
    password: {
      presence: {
        allowEmpty: false,
        message: "^Please choose password",
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
          let count =
            typeof payload.value === "string"
              ? await usersRepo.findUserByTypeAndValue({
                  value: payload.value,
                  type: payload.type,
                })
              : -1;
          return count === 0 ? true : false;
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
    let inputPayload = { ...prepareResult };
    await validateInput(inputPayload);
    const userProfile = pickKeysFromObject(prepareResult, ["meta"]);
    return await usersRepo.registerWithPassword(prepareResult, userProfile);
  } catch (error) {
    throw error;
  }
};

const respond = ({ handleResult }) => {
  if (handleResult === undefined) {
    return {
      message: "Successfully Registered",
    };
  } else {
    return {
      message: "Already Registered",
    };
  }
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
