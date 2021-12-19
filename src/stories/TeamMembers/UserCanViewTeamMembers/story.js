const teamMembersRepo = requireRepo("teamMembers");
const teamsRepo = requireRepo("teams");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_uuid"]);
  payload["invoking_user_uuid"] = req.sub;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    let teamMember = await teamMembersRepo.findWithConstraints({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.invoking_user_uuid,
    });

    return { teamMember };
  } catch (error) {
    console.log("userCanViewTeamMembers-augment-prepare-error", error);
    throw error;
  }
};

const authorize = ({ augmentPrepareResult }) => {
  try {
    if (augmentPrepareResult.teamMember) {
      return true;
    }

    throw {
      message: "NotAuthorized",
      statusCode: 403,
    };
  } catch (error) {
    console.log("userCanViewTeamMembers-authorize-error", error);
    throw error;
  }
};

const handle = async ({ prepareResult }) => {
  try {
    return await teamMembersRepo.getTeamsAndMembers({
      "team_members.team_uuid": prepareResult.team_uuid,
    });
  } catch (error) {
    console.log("userCanViewTeamMembers-handle-error", error);
    throw error;
  }
};

const respond = ({ handleResult }) => {
  return handleResult;
};

module.exports = {
  prepare,
  augmentPrepare,
  authorize,
  handle,
  respond,
};
