const validator = requireValidator();
const TeamMemberRepo = requireRepo("teamMembers");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
// const getUser = requireFunction("getUser");
const TeamMemberSerializer = requireSerializer("teamMembers");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_member_uuid"]);
  payload["invoking_user_uuid"] = req.user;
  payload["token"] = req.token;

  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  let teamMember = null;

  try {
    teamMember = await TeamMemberRepo.first({
      uuid: prepareResult.team_member_uuid,
    });
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Invalid Member",
    };
  }

  let user = {};

  try {
    console.log('prepareResult["sub"]13', prepareResult["sub"]);
    user = prepareResult["sub"];
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  return { teamMember, user };
};

const authorize = async ({ augmentPrepareResult }) => {
  if (!augmentPrepareResult.teamMember) {
    throw {
      message: "NotAuthorized",
      statusCode: 403,
    };
  }

  if (augmentPrepareResult.teamMember) {
    if (augmentPrepareResult.teamMember.status !== "invited") {
      throw {
        statusCode: 401,
        message:
          "The membership status is not invited. Either it's already accepted or invalid.",
      };
    }

    if (
      augmentPrepareResult.teamMember.email !== augmentPrepareResult.user.email
    ) {
      throw {
        statusCode: 422,
        message: "Invalid User",
      };
    }
  }

  return true;
};

const handle = async ({ prepareResult, augmentPrepareResult }) => {
  return await TeamMemberRepo.update(prepareResult.team_member_uuid, {
    status: "accepted",
    user_uuid: augmentPrepareResult.user.id,
  });
};

const respond = async ({ handleResult }) => {
  return await TeamMemberSerializer.single(handleResult);
};

module.exports = {
  prepare,
  augmentPrepare,
  authorize,
  handle,
  respond,
};
