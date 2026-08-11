const findKeysFromRequest = requireUtil("findKeysFromRequest");
const pingFederateClient = requireFunction("pingFederateClient");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["state"]);

  if (typeof payload.state !== "string" || !payload.state.trim()) {
    throw {
      statusCode: 422,
      message: "PingFederate state is required",
    };
  }

  return payload;
};

const authorize = async () => true;

const handle = async ({ prepareResult }) => {
  const authorizeUrl = await pingFederateClient.getAuthorizationUrl(
    prepareResult
  );
  return { pingfederate_authorization_url: authorizeUrl };
};

const respond = async ({ handleResult }) => handleResult;

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
