// const getUser = requireFunction("getUser");
const teamMemberRepo = requireRepo("teamMembers");
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ req }) => {
  try {
    const payload = findKeysFromRequest(req, ["tenant"]);
    payload["invoking_user_uuid"] = req.sub;

    return payload;
  } catch (error) {
    throw error;
  }
};

const authorize = () => {
  return true;
};

const augmentPrepare = async ({ prepareResult }) => {
  let user = {};

  try {
    user = await usersRepo.first({ uuid: prepareResult["invoking_user_uuid"] });

    if (user === undefined) {
      throw user;
    }
    return { user };
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }
};

const handle = async ({ prepareResult, augmentPrepareResult }) => {
  try {
    // 1. Current logged in user, get the attributes for them
    // 2. For those attributes, see if there are any invites
    const loggedInUserAttributes = [
      { type: "email", value: "rajiv@betalectic.com" },
      { type: "email", value: "rajivs.iitkgp@gmail.com" },
    ];

    return await teamMemberRepo.getTeamsAndMembers({
      "teams.tenant": prepareResult["tenant"],
      "team_members.user_uuid": augmentPrepareResult.user.uuid,
      "team_members.status": "invited",
    });
  } catch (error) {
    throw error;
  }
};

const respond = ({ handleResult }) => {
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
