const tokensRepo = requireRepo("tokens");
const usersRepo = requireRepo("users");
const UserSerializer = requireSerializer("user");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const validator = requireValidator();

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["old_password", "password"]);
  payload["jti"] = req.jti;
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
    old_password: {
      presence: {
        allowEmpty: false,
        message: "^Please choose password",
      },
    },
    password: {
      presence: {
        allowEmpty: false,
        message: "^Please choose password",
      },
    },
  };

  return validator(payload, constraints);
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let inputPayload = prepareResult;
    await validateInput(inputPayload);
    return await usersRepo.verifyOldPasswordAndResetPassword(
      authorizeResult.sub,
      inputPayload
    );
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return {
      message: "Password successfully updated",
    };
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
