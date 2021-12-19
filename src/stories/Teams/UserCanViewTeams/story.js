const teamMemberRepo = requireRepo("teamMembers");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["tenant"]);
  payload["invoking_user_uuid"] = req.user;
  return payload;
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

    return await teamMemberRepo.getTeamsAndMembers(payload);
  } catch (error) {
    console.log("userCanViewTeam-handleResult-error", error);
    throw error;
  }
};

const respond = ({ handleResult }) => {
  return handleResult;
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
