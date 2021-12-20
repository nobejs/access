const teamMembersRepo = requireRepo("teamMembers");
const teamsRepo = requireRepo("teams");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_member_uuid", "team_uuid"]);
  payload["invoking_user_uuid"] = req.sub;

  return payload;
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

    if (teamMember === undefined) {
      throw {
        message: "Team Member not found",
        statusCode: 404,
      };
    }

    return { team, teamMember };
  } catch (error) {
    // console.error("userCanDeleteTeamMember-augumentResult-error", error);
    throw error;
  }
};

const authorize = async ({ prepareResult, augmentPrepareResult }) => {
  // Check if this team atleast one owner before
  try {
    let permissions = await getTeamMemberPermissions({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.invoking_user_uuid,
    });

    await checkPermission(permissions, ["admin"]);
  } catch (error) {
    console.log("userCanDeleteTeamMember-authorize-error", error);
    throw error;
  }
};

const handle = async ({ prepareResult, storyName }) => {
  try {
    return await teamMembersRepo.del({
      uuid: prepareResult.team_member_uuid,
    });
  } catch (error) {
    console.log("userCanDeleteTeamMember-handler-error", error);
    throw error;
  }
};

const respond = ({ handleResult }) => {
  try {
    return {
      message: "Deleted successfully",
    };
  } catch (error) {
    console.log("userCanDeleteTeamMember-respondResult-error", error);
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
