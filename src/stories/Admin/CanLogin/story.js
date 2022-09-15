const validator = requireValidator();
const adminRepo = requireRepo("admin");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["email", "password"]);
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
    email: {
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

const respond = ({ handleResult }) => {
  return { access_token: handleResult };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
