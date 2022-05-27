const validator = requireValidator();
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const getAllowedTypes = requireFunction("getAllowedTypes");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["type", "value"]);
  return payload;
};

const authorize = ({ prepareResult }) => {
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
    return await usersRepo.generateOTPForLogin(prepareResult);
  } catch (error) {
    throw error;
  }
};

const respond = () => {
  return {
    message: "Request for login with otp successfully",
  };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
