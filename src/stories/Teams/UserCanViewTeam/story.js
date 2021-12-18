const TeamsRepo = requireRepo("teams");
const TeamMembersRepo = requireRepo("teamMembers");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const TeamSerializer = requireSerializer("teams");
const createCustomerPortal = requireFunction("stripe/createCustomerPortal");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_uuid", "stripe_return_url"]);

  payload["invoking_user_uuid"] = req.user;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  let teamMember = await TeamMembersRepo.first({
    team_uuid: prepareResult.team_uuid,
    user_uuid: prepareResult.invoking_user_uuid,
  });

  return { teamMember };
};

const authorize = ({ augmentPrepareResult }) => {
  if (augmentPrepareResult.teamMember) {
    return true;
  }

  throw {
    message: "NotAuthorized",
    statusCode: 403,
  };
};

const handle = async ({ prepareResult, storyName }) => {
  return await TeamsRepo.first({
    uuid: prepareResult.team_uuid,
  });
};

const respond = async ({ prepareResult, handleResult }) => {
  try {
    const teamObject = await TeamSerializer.single(handleResult, [
      "subscription",
    ]);

    if (
      teamObject["subscription"] &&
      teamObject["subscription"]["customer_id"]
    ) {
      teamObject["customer_portal"] = await createCustomerPortal(
        teamObject["subscription"]["customer_id"],
        prepareResult.stripe_return_url
      );
    }

    return teamObject;
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
