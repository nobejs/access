const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();
const verificationsRepo = requireRepo("verifications");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["user_uuid", "token", "password"]);
  return payload;
};

const authorize = async ({ prepareResult }) => {
  try {
    if (0) {
      throw {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const validateInput = async (payload) => {
  const constraints = {
    password: {
      presence: {
        allowEmpty: false,
        message: "^Please choose password",
      },
    },
    user_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please choose user_uuid",
      },
    },
    token: {
      presence: {
        allowEmpty: false,
        message: "^Please enter token",
      },
      type: "string",
      custom_callback: {
        message: "Invalid token or user",
        callback: async (payload) => {
          try {
            let verification =
              typeof payload.token === "string"
                ? await verificationsRepo.findVerificationForResetPassword({
                    user_uuid: payload.user_uuid,
                    token: payload.token,
                  })
                : -1;

            return verification !== undefined ? true : false;
          } catch (error) {
            console.log("are we here");
            return false;
          }
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
    return await usersRepo.verifyAttributeForResetPasswordWithLink(
      inputPayload
    );
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
