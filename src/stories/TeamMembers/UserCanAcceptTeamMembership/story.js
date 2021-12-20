const validator = requireValidator();
const teamMembersRepo = requireRepo("teamMembers");
const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
// const getUser = requireFunction("getUser");
const TeamMemberSerializer = requireSerializer("teamMembers");

const prepare = async ({ req }) => {
  try {
    console.log("called123");
    const payload = findKeysFromRequest(req, ["team_member_uuid"]);
    payload["invoking_user_uuid"] = req.sub;
    return payload;
  } catch (error) {
    console.log("userCanAcceptTeamMemberships-prepare-error", error);
    throw error;
  }
};

const augmentPrepare = async ({ prepareResult }) => {
  let teamMember = null;

  try {
    teamMember = await teamMembersRepo.findWithConstraints({
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
    return { teamMember };
  } catch (error) {
    console.log("userCanAcceptTeamMemberships-augmentPrepare-error", error);
    throw {
      statusCode: 404,
      message: "Invalid Member",
    };
  }
};

const authorize = async ({ prepareResult, augmentPrepareResult }) => {
  try {
    console.log(
      "CHECK",
      augmentPrepareResult.teamMember.user_uuid,
      prepareResult.invoking_user_uuid
    );
    if (
      augmentPrepareResult.teamMember.user_uuid !==
      prepareResult.invoking_user_uuid
    ) {
      throw {
        statusCode: 403,
        message: "Not Authorized",
      };
    }

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
    console.log("userCanAcceptTeamMemberships-authorize-error", error);
    throw error;
  }
};

const handle = async ({ prepareResult }) => {
  try {
    return await teamMembersRepo.update(prepareResult.team_member_uuid, {
      status: "accepted",
      user_uuid: prepareResult.invoking_user_uuid,
    });
  } catch (error) {
    console.log("userCanAcceptTeamMemberships-handle-error", error);
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return await TeamMemberSerializer.single(handleResult);
  } catch (error) {
    console.log("userCanAcceptTeamMemberships-respond-error", error);
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
