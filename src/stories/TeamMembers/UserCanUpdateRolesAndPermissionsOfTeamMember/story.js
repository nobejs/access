const findKeysFromRequest = requireUtil("findKeysFromRequest");
const teamsRepo = requireRepo("teams");
const teamMembersRepo = requireRepo("teamMembers");
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");
const validator = requireValidator();

const prepare = ({ req }) => {
  try {
    const payload = findKeysFromRequest(req, [
      "team_member_uuid",
      "team_uuid",
      "role_uuid",
      "permissions",
    ]);
    payload["invoking_user_uuid"] = req.sub;

    return payload;
  } catch (error) {
    console.log("userCanUpdateRolesAndPermissions-prepare-error", error);
    throw error;
  }
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    let team = await teamsRepo.findByUuid({
      uuid: prepareResult.team_uuid,
    });

    if (team === undefined) {
      throw {
        message: "Team not found",
        statusCode: 404,
      };
    }

    let teamMember = await teamMembersRepo.findWithConstraints({
      team_uuid: prepareResult.team_uuid,
      uuid: prepareResult.team_member_uuid,
    });

    if (teamMember === undefined || teamMember.status === "invited") {
      throw {
        message: "Team Member not found",
        statusCode: 404,
      };
    }

    return { team, teamMember };
  } catch (error) {
    console.log("userCanUpdateRolesAndPermissions-augmentPrepare-error", error);
    throw error;
  }
};

const authorize = async ({ prepareResult }) => {
  try {
    let permissions = await getTeamMemberPermissions({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.invoking_user_uuid,
    });

    await checkPermission(permissions, ["admin"]);
  } catch (error) {
    throw error;
  }
};

const validateInput = async (payload) => {
  const constraints = {
    permissions: {
      presence: {
        allowEmpty: false,
        message: "^Please choose permissions",
      },
    },
  };
  await validator(payload, constraints);
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    await validateInput(prepareResult);

    let payload = {
      team_member_uuid: prepareResult.team_member_uuid,
      role_uuid: prepareResult.role_uuid,
      permissions: prepareResult.permissions,
    };
    return await teamMembersRepo.updateRolesAndPermissions(payload);
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
  augmentPrepare,
  authorize,
  handle,
  respond,
};
