const teamMembersRepo = requireRepo("teamMembers");
const teamsRepo = requireRepo("teams");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_uuid"]);
  payload["invoking_user_uuid"] = req.sub;
  return payload;
};

const validateInput = async (payload) => {
  const constraints = {
    team_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please choose team_uuid",
      },
      format: {
        pattern:
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message: "^Invalid team_uuid",
      },
    },
    invoking_user_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please choose invoking_user_uuid",
      },
      format: {
        pattern:
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message: "^Invalid invoking_user_uuid",
      },
    },
  };

  await validator(payload, constraints);
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    await validateInput(prepareResult);

    let teamMember = await teamMembersRepo.findWithConstraints({
      team_uuid: prepareResult.team_uuid,
      user_uuid: prepareResult.invoking_user_uuid,
    });

    return { teamMember };
  } catch (error) {
    throw error;
  }
};

const authorize = ({ augmentPrepareResult }) => {
  try {
    if (
      augmentPrepareResult.teamMember &&
      augmentPrepareResult.teamMember.user_uuid
    ) {
      return true;
    }

    throw {
      message: "NotAuthorized",
      statusCode: 403,
    };
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult }) => {
  try {
    return await teamMembersRepo.getTeamsAndMembers({
      "team_members.team_uuid": prepareResult.team_uuid,
    });
  } catch (error) {
    throw error;
  }
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
