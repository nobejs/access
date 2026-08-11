const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const pingFederateClient = requireFunction("pingFederateClient");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["code"]);

  if (typeof payload.code !== "string" || !payload.code.trim()) {
    throw {
      statusCode: 422,
      message: "PingFederate authorization code is required",
    };
  }

  return payload;
};

const authorize = () => true;

const handle = async ({ prepareResult }) => {
  const pingFederateIdToken = await pingFederateClient.exchangeCodeForIdToken(
    prepareResult.code
  );
  const pingFederateUser = await pingFederateClient.getAuthenticatedUser(
    pingFederateIdToken
  );
  return usersRepo.registerUserFromPingFederate(pingFederateUser);
};

const respond = ({ handleResult }) => ({ access_token: handleResult });

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
