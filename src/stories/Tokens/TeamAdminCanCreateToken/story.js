const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["title", "permissions"]);

  payload = Object.assign(
    payload,
    ...{
      jti: req.jti,
      sub: req.sub,
      issuer: req.issuer,
    }
  );

  payload["team_uuid"] = req.headers["x-team-identifier"];

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
    await validateInput(prepareResult);

    // Get Team member permissions

    let permissions = await getTeamMemberPermissions({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.sub,
    });

    await checkPermission(permissions, ["admin", "create_token"]);
  } catch (error) {
    throw error;
  }
  return true;
};

const handle = async ({ prepareResult, storyName }) => {
  try {
    let token = await tokensRepo.createTokenForTeam(
      team_uuid,
      title,
      permissions
    );
    return token;
  } catch (error) {
    throw error;
  }

  return {};
};

const respond = ({ handleResult }) => {
  return { token: token };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
