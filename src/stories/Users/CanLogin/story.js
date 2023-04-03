const validator = requireValidator();
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const getAllowedTypes = requireFunction("getAllowedTypes");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["type", "value", "password"]);
  return payload;
};

const authorize = ({ prepareResult }) => {
  // Anyone can access this endpoint
  return true;
};

const validateInput = async (payload) => {
  const constraints = {
    password: {
      presence: {
        allowEmpty: false,
        message: "^Please enter password",
      },
    },
    type: {
      presence: {
        allowEmpty: false,
        message: "^Please choose type",
      },
      inclusion: {
        within: getAllowedTypes(),
        message: "^Please choose valid type",
      },
    },
    value: {
      presence: {
        allowEmpty: false,
        message: "^Please enter a value",
      },
    },
  };

  return validator(payload, constraints);
};

const handle = async ({ prepareResult }) => {
  try {
    let inputPayload = { ...prepareResult };
    await validateInput(inputPayload);
    return await usersRepo.authenticateWithPassword(prepareResult);
  } catch (error) {
    throw error;
  }
};

const respond = ({ handleResult }) => {
  return {
    access_token: handleResult.token,
    mfa_enabled: handleResult.mfa_enabled,
  };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
