const validator = requireValidator();
const teamMemberRepo = requireRepo("teamMembers");
const teamRepo = requireRepo("teams");
const userRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const TeamMemberSerializer = requireSerializer("teamMembers");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "team_uuid",
    "attribute_type",
    "attribute_value",
  ]);
  payload["invoking_user_uuid"] = req.user;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    let team = await teamRepo.findByUuid({
      uuid: prepareResult.team_uuid,
    });
    return { team };
  } catch (error) {
    console.log("userCanCreateTeamMember-augmentPrepare-error", error);
    throw {
      message: "Team not found",
      statusCode: 404,
    };
  }
};

const authorize = async ({ prepareResult, augmentPrepareResult }) => {
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

const validateInput = async ({ prepareResult }) => {
  const constraints = {
    team_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please enter team_uuid",
      },
    },
  };

  const constraints2 = {
    type: {
      presence: {
        allowEmpty: false,
        message: "^Please choose type",
      },
      inclusion: {
        within: userRepo.getAllowedTypes(),
        message: "^Please choose valid type",
      },
    },
    value: {
      type: "string",
      custom_callback: {
        message: `${prepareResult.value} is already part of team`,
        callback: async (payload) => {
          let count =
            typeof payload.value === "string"
              ? await teamMemberRepo.countWithConstraints({
                  attribute_value: prepareResult.value,
                  team_uuid: prepareResult.team_uuid,
                })
              : -1;

          return count === 0 ? true : false;
        },
      },
    },
  };

  await validator(prepareResult, constraints);
  await validator(prepareResult, constraints2);
};

const handle = async ({ prepareResult, augmentPrepareResult, storyName }) => {
  try {
    await validateInput({ prepareResult, augmentPrepareResult });

    let payload = {
      team_uuid: prepareResult.team_uuid,
      attribute_type: prepareResult.type,
      attribute_value: prepareResult.value,
      status: "invited",
      role_uuid: prepareResult.role_uuid,
      permissions: prepareResult.permissions,
      user_uuid: prepareResult.invoking_user_uuid,
    };

    return await teamMemberRepo.createTeamMember(payload);
  } catch (error) {
    console.log("userCanCreateTeamMember-handler-error", error);
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return await TeamMemberSerializer.single(handleResult);
  } catch (error) {
    console.log("userCanCreateTeamMember-respondResult-Error", error);
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
