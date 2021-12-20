const teamMembersRepo = requireRepo("teamMembers");
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

const authorize = () => {
  return true;
};

const handle = async ({ prepareResult, augmentPrepareResult }) => {
  try {
    let teamMembers = await teamMembersRepo.getUserTeamInvites(
      augmentPrepareResult.user.uuid
    );
    return teamMembers;
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
