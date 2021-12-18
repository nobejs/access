const validator = requireValidator();
const teamMemberRepo = requireRepo("teamMembers");
const teamRepo = requireRepo("teams");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const TeamMemberSerializer = requireSerializer("team_member");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, ["team_uuid", "email"]);
  payload["invoking_user_uuid"] = req.user;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    let team = await teamRepo.findTeamByUUID({
      uuid: prepareResult.team_uuid,
    });
    return { team };
  } catch (error) {
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
    email: {
      presence: {
        allowEmpty: false,
        message: "^Please enter email",
      },
    },
  };

  const constraints2 = {
    email: {
      type: "string",
      custom_callback: {
        message: "email is already part of team",
        callback: async (payload) => {
          let count =
            typeof payload.email === "string"
              ? await teamMemberRepo.countWithConstraints({
                  email: prepareResult.email,
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
  await validateInput({ prepareResult, augmentPrepareResult });

  let payload = {
    team_uuid: prepareResult.team_uuid,
    email: prepareResult.email,
    status: "invited",
    role: "member",
  };

  return await teamMemberRepo.createTeamMember(payload);
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
