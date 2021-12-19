const teamsRepo = requireRepo("teams");
const teamMembersRepo = requireRepo("teamMembers");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const teamSerializer = requireSerializer("teams");
const usersRepo = requireRepo("users");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_uuid", "stripe_return_url"]);
  payload["invoking_user_uuid"] = req.sub;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    let teamMember = await teamMembersRepo.first({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.invoking_user_uuid,
    });

    if (teamMember === undefined) {
      throw teamMember;
    }

    return { teamMember, prepareResult };
  } catch (error) {
    throw {
      statusCode: 404,
      message: "Invalid Member",
    };
  }
};

const authorize = async ({ augmentPrepareResult, prepareResult }) => {
  try {
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
  } catch (error) {
    console.log("userCanViewTeam-authorize-error", error);
    throw error;
  }
};

const handle = async ({ prepareResult, storyName }) => {
  try {
    return await teamsRepo.findByUuid({
      uuid: prepareResult.team_uuid,
    });
  } catch (error) {
    console.log("UserCanViewTeam-handler-error", error);
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult }) => {
  try {
    const teamObject = await teamSerializer.single(handleResult, [
      "subscription",
    ]);

    // if (
    //   teamObject["subscription"] &&
    //   teamObject["subscription"]["customer_id"]
    // ) {
    //   teamObject["customer_portal"] = await createCustomerPortal(
    //     teamObject["subscription"]["customer_id"],
    //     prepareResult.stripe_return_url
    //   );
    // }

    return teamObject;
  } catch (error) {
    console.log("UserCanViewTeam-respondResult-error", error);
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
