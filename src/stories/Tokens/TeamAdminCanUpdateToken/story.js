const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const tokensRepo = requireRepo("tokens");

const prepare = ({ req }) => {
  let payload = findKeysFromRequest(req, ["title", "permissions", "team_uuid", "token_uuid"]);

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
    title: {
      presence: {
        allowEmpty: false,
        message: "^Please mention title",
      },
    },
    permissions: {
      presence: {
        allowEmpty: false,
        message: "^Please mention permissions",
      },
    },
  };

  return validator(payload, constraints);
};

const handle = async ({ prepareResult }) => {
  try {
    let token = await tokensRepo.update({
      uuid: prepareResult.token_uuid,
    }, {
      title: prepareResult.title,
      permissions: prepareResult.permissions,
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
