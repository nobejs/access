const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, [
    "code",
    "state",
    "purpose",
    "status",
  ]);
  console.log("check here payload", payload);
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

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    const token = prepareResult.code;
    return token;
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult, res }) => {
  try {
    if (prepareResult.purpose === "verify") {
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?platform=whatsapp&status=${prepareResult.status}`;
      return res.redirect(redirectWithTokenUrl);
    } else {
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult}&platform=whatsapp`;
      return res.redirect(redirectWithTokenUrl);
    }
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
