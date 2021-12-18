const validator = requireValidator();
const teamMembersRepo = requireRepo("teamMembers");
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
// const getUser = requireFunction("getUser");
const TeamMemberSerializer = requireSerializer("teamMembers");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_member_uuid"]);
  payload["invoking_user_uuid"] = req.sub;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  let teamMember = null;

  try {
    teamMember = await teamMembersRepo.first({
      uuid: prepareResult.team_member_uuid,
    });

    if (teamMember === undefined) {
      throw teamMember;
    }

    if (teamMember.status !== "invited") {
      throw {
        statusCode: 401,
        message:
          "The membership status is not invited. Either it's already accepted or invalid.",
      };
    }
  } catch (error) {
    throw {
      statusCode: 404,
      message: "Invalid Member",
    };
  }

  return { teamMember };
};

const authorize = async ({ prepareResult, augmentPrepareResult }) => {
  if (augmentPrepareResult.teamMember) {
    let userAttribute = await usersRepo.findUserByTypeAndValue({
      user_uuid: prepareResult.invoking_user_uuid,
      type: augmentPrepareResult.teamMember.attribute_type,
      value: augmentPrepareResult.teamMember.attribute_value,
    });

    if (userAttribute == undefined) {
      throw {
        statusCode: 422,
        message: "Invalid User",
      };
    }
  } else {
    throw {
      statusCode: 404,
      message: "Invalid Member",
    };
  }
};

const handle = async ({ prepareResult }) => {
  return await teamMembersRepo.update(prepareResult.team_member_uuid, {
    status: "accepted",
    user_uuid: prepareResult.invoking_user_uuid,
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
