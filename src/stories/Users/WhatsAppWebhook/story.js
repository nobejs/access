const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");

const prepare = ({ reqQuery, reqBody, reqParams, req, res }) => {
  const payload = findKeysFromRequest(req, [
    "hub.mode",
    "hub.verify_token",
    "hub.challenge",
  ]);
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
    if (
      prepareResult["hub.mode"] == "subscribe" &&
      prepareResult["hub.verify_token"] ==
        process.env.WHATSAPP_ENDPOINT_VERIFICATION_CODE
    ) {
      res.send(prepareResult["hub.challenge"]);
    } else {
      res.code(400);
    }
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
