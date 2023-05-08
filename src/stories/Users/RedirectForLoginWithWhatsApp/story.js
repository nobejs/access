const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req, res }) => {
  const payload = findKeysFromRequest(req, []);
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

const handle = async ({ prepareResult, authorizeResult, res }) => {
  try {
    const redirect_link = `https://wa.me/${
      process.env.WHATSAPP_PHONE_NUMBER
    }?text=${encodeURI("Login with WhatsApp")}`;

    return { redirect_to: redirect_link };
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult }) => {
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
