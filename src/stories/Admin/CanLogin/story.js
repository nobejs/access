const validator = requireValidator();
const adminRepo = requireRepo("admin");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["value", "password"]);
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
        message: "^Please enter password",
      },
    },
    value: {
      presence: {
        allowEmpty: false,
        message: "^Please enter email",
      },
    },
  };

  return validator(payload, constraints);
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let inputPayload = { ...prepareResult };
    await validateInput(inputPayload);
    return await adminRepo.authenticateWithPassword(prepareResult);
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
