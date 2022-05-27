const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const tokensRepo = requireRepo("tokens");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  let payload = findKeysFromRequest(req, ["team_uuid", "token_uuid"]);

  payload = {
    ...payload,
    ...{
      jti: req.jti,
      sub: req.sub,
      issuer: req.issuer,
    },
  };

  return payload;
};

const authorize = async ({ prepareResult }) => {
  try {
    if (prepareResult.issuer !== "user") {
      throw {
        statusCode: 403,
        message: "Forbidden",
      };
    }

    await validateInput(prepareResult);

    // Get Team member permissions

    let permissions = await getTeamMemberPermissions({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.sub,
    });

    await checkPermission(permissions, ["admin", "manage_tokens"]);
  } catch (error) {
    throw error;
  }
};

const validateInput = async (payload) => {
  const constraints = {
    token_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please mention token_uuid",
      },
    },
    team_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please mention team",
      },
    },
  };

  return validator(payload, constraints);
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let token = await tokensRepo.first({
      uuid: prepareResult.token_uuid,
    });
    return token;
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
