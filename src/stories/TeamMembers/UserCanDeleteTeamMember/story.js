const validator = requireValidator();
const TeamMemberRepo = requireRepo("teamMember");
const TeamRepo = requireRepo("team");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_member_uuid", "team_uuid"]);
  payload["invoking_user_uuid"] = req.user;
  payload["token"] = req.token;

  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    let team = await TeamRepo.first({
      uuid: prepareResult.team_uuid,
    });

    let teamMember = await TeamMemberRepo.first({
      team_uuid: prepareResult.team_uuid,
      uuid: prepareResult.team_member_uuid,
    });

    return { team, teamMember };
  } catch (error) {
    throw {
      message: "Team not found",
      statusCode: 404,
    };
  }
};

const authorize = async ({ prepareResult, augmentPrepareResult }) => {
  // Check if this team atleast one owner before

  if (augmentPrepareResult.teamMember.role === "owner") {
    throw {
      message: "Owner cannot be deleted. Downgrade them to Member to delete.",
      statusCode: 422,
    };
  }

  if (
    augmentPrepareResult.team.creator_user_uuid ===
    prepareResult.invoking_user_uuid
  ) {
    return true;
  }

  throw {
    message: "NotAuthorized",
    statusCode: 403,
  };
};

const handle = async ({ prepareResult, storyName }) => {
  return await TeamMemberRepo.del({
    uuid: prepareResult.team_member_uuid,
  });
};

const respond = ({ handleResult }) => {
  return {
    message: "Deleted successfully",
  };
};

module.exports = {
  prepare,
  augmentPrepare,
  authorize,
  handle,
  respond,
};
