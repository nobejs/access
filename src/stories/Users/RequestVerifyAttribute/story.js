const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const tokensRepo = requireRepo("tokens");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "type",
    "value",
    "purpose",
    "verification_method",
    "success_redirect",
    "failure_redirect",
  ]);
  payload["jti"] = req.jti;
  payload["verification_method"] = payload["verification_method"]
    ? payload["verification_method"]
    : "otp";
  return payload;
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
        message: "No verification requested",
        callback: async (payload) => {
          let verification =
            typeof payload.value === "string"
              ? await verificationsRepo.findVerificationForUpdate({
                  attribute_value: payload.value,
                  attribute_type: payload.type,
                  user_uuid: payload.sub,
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

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let inputPayload = { ...prepareResult, ...authorizeResult };
    await validateInput(inputPayload);
    await usersRepo.requestAttributeVerificationForUpdate(inputPayload);
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
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
