const validator = requireValidator();
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const rolesRepo = requireRepo("roles");
const roleSerializer = requireSerializer("role");

const prepare = ({ req }) => {
  let payload = findKeysFromRequest(req, ["title", "permissions", "team_uuid"]);

  payload = {
    ...payload,
    ...{
      sub: req.sub,
      issuer: req.issuer,
    },
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
    if (prepareResult.issuer !== "user") {
      throw {
        statusCode: 403,
        message: "Forbidden",
      };
    }

    await validateInput(prepareResult);

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
    let token = await rolesRepo.createRoleForTeam({
      team_uuid: prepareResult.team_uuid,
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
    return await roleSerializer.single(handleResult);
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
