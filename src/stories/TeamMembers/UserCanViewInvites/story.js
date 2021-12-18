const getUser = requireFunction("getUser");
const TeamMemberRepo = requireRepo("teamMember");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["tenant"]);
  payload["invoking_user_uuid"] = req.user;
  payload["token"] = req.token;

  return payload;
};

const authorize = () => {
  return true;
};

const augmentPrepare = async ({ prepareResult }) => {
  let user = {};

  try {
    user = await getUser(prepareResult["token"]);
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  return { user };
};

const handle = async ({ prepareResult, augmentPrepareResult }) => {
  return await TeamMemberRepo.getTeamsAndMembers({
    "teams.tenant": prepareResult["tenant"],
    "team_members.email": augmentPrepareResult.user.email,
    "team_members.status": "invited",
  });
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
