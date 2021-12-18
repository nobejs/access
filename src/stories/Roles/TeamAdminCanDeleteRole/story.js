const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const rolesRepo = requireRepo("roles");
const roleSerializer = requireSerializer("role");

const prepare = ({ req }) => {
  let payload = findKeysFromRequest(req, ["role_uuid", "team_uuid"]);

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

const handle = async ({ prepareResult }) => {
  try {
    let token = await rolesRepo.deleteRoleByUUID(prepareResult.role_uuid);
    return token;
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return {
      message: "Role successfully deleted",
    };
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
