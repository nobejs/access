const TeamMemberRepo = requireRepo("teamMember");
const knex = requireKnex();
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const underscoredColumns = requireUtil("underscoredColumns");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["tenant"]);
  payload["invoking_user_uuid"] = req.user;
  return payload;
};

const authorize = ({}) => {
  return true;
};

const handle = async ({ prepareResult }) => {
  let payload = {
    "team_members.user_uuid": prepareResult.invoking_user_uuid,
  };

  if (prepareResult.tenant) {
    payload["teams.tenant"] = prepareResult.tenant;
  }

  return await TeamMemberRepo.getTeamsAndMembers(payload);
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
