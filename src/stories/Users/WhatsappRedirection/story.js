const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["code", "state"]);
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
    if (prepareResult.state === "redirect_with_token") {
      const redirectWithTokenUrl = `${process.env.REDIRECT_WITH_TOKEN_ENDPOINT}?access_token=${handleResult}&platform=whatsapp`;
      console.log("check here url::>", redirectWithTokenUrl);
      return res.redirect(redirectWithTokenUrl);
    }

    return { access_token: handleResult };
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
