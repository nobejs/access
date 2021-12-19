const teamMembersRepo = requireRepo("teamMembers");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = async ({ req }) => {
  try {
    const payload = findKeysFromRequest(req, ["tenant"]);
    payload["invoking_user_uuid"] = req.sub;
    return payload;
  } catch (error) {
    console.log("userCanViewTeam-prepareResult-error", error);
  }
};

const authorize = ({}) => {
  return true;
};

const handle = async ({ prepareResult }) => {
  try {
    let payload = {
      "team_members.user_uuid": prepareResult.invoking_user_uuid,
    };

    if (prepareResult.tenant) {
      payload["teams.tenant"] = prepareResult.tenant;
    }

    return await teamMembersRepo.getTeamsAndMembers(payload);
  } catch (error) {
    console.log("userCanViewTeam-handleResult-error", error);
    throw error;
  }
};

const respond = ({ handleResult }) => {
  try {
    return handleResult;
  } catch (error) {
    console.log("UserCanViewTeams-respondResult-error", error);
    throw error;
  }
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
