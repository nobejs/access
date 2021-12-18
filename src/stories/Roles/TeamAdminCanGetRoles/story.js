const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const rolesRepo = requireRepo("roles");
const roleSerializer = requireSerializer("role");

const prepare = ({ req }) => {
  let payload = findKeysFromRequest(req, ["team_uuid"]);

  payload = {
    ...payload,
    ...{
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

    let permissions = await getTeamMemberPermissions({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.sub,
    });

    await checkPermission(permissions, ["admin", "manage_roles"]);
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let role = await rolesRepo.getRolesForTeam({
      team_uuid: prepareResult.team_uuid,
    });
    return role;
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
