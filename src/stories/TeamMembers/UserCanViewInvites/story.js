// const getUser = requireFunction("getUser");
const TeamMemberRepo = requireRepo("teamMembers");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["tenant"]);
  payload["invoking_user_uuid"] = req.sub;
  payload["token"] = req.token;

  return payload;
};

const authorize = () => {
  return true;
};

const augmentPrepare = async ({ prepareResult }) => {
  let user = {};

  try {
    user = prepareResult["sub"];
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  return { user };
};

const handle = async ({ prepareResult, augmentPrepareResult }) => {
  // return await TeamMemberRepo.getTeamsAndMembers({
  //   "teams.tenant": prepareResult["tenant"],
  //   "team_members.email": augmentPrepareResult.user.email,
  //   "team_members.status": "invited",
  // });
  return {};
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
