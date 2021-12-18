const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const tokensRepo = requireRepo("tokens")

const prepare = ({ req }) => {
  let payload = findKeysFromRequest(req, ["title", "permissions", "team_uuid"]);

  payload = {
    ...payload,
    ...{
      jti: req.jti,
      sub: req.sub,
      issuer: req.issuer,
    }
  };

  return payload;
};

const validateInput = async (payload) => {
  const constraints = {
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

const authorize = async ({ prepareResult }) => {

  try {

    if (prepareResult.issuer !== 'user') {
      throw {
        statusCode: 403,
        message: "Forbidden"
      }
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

const handle = async ({ prepareResult, storyName }) => {

  try {
    let token = await tokensRepo.createTokenForTeam({
      team_uuid: prepareResult.team_uuid,
      title: prepareResult.team_uuid,
      permissions: prepareResult.permissions
    });
    return token;
  } catch (error) {
    throw error;
  }

};

const respond = ({ handleResult }) => {
  return { token: handleResult };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
