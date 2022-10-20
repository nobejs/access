const validator = requireValidator();
const teamMembersRepo = requireRepo("teamMembers");
const teamRepo = requireRepo("teams");
const userRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const TeamMemberSerializer = requireSerializer("teamMembers");
const getTeamMemberPermissions = requireFunction("getTeamMemberPermissions");
const checkPermission = requireFunction("checkPermission");

const prepare = async ({ req }) => {
  const payload = findKeysFromRequest(req, [
    "team_uuid",
    "attribute_type",
    "attribute_value",
    "role_uuid",
    "permissions",
  ]);
  payload["issuer"] = req.issuer;
  payload["invoking_user_uuid"] = req.sub;
  return payload;
};

const augmentPrepare = async ({ prepareResult }) => {
  try {
    await validator(prepareResult, {
      team_uuid: {
        presence: {
          allowEmpty: false,
          message: "^Please enter team_uuid",
        },
      },
    });

    let team = await teamRepo.findByUuid({
      uuid: prepareResult.team_uuid,
    });

    if (team === undefined) {
      throw team;
    }

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
  // if (
  //   augmentPrepareResult.team.creator_user_uuid ===
  //   prepareResult.invoking_user_uuid
  // ) {
  //   return true;
  // }

  try {
    if (prepareResult.issuer === "admin") {
    } else {
      let permissions = await getTeamMemberPermissions({
        team_uuid: prepareResult.team_uuid,
        user_uuid: prepareResult.invoking_user_uuid,
      });

      await checkPermission(permissions, ["admin"]);
    }
  } catch (error) {
    throw error;
  }
};

const validateInput = async (payload) => {
  const constraints2 = {
    attribute_type: {
      presence: {
        allowEmpty: false,
        message: "^Please choose type",
      },
      inclusion: {
        within: userRepo.getAllowedTypes(),
        message: "^Please choose valid type",
      },
    },
    attribute_value: {
      type: "string",
      custom_callback: {
        message: `${payload.attribute_value} is already part of team`,
        callback: async (payload) => {
          let count =
            typeof payload.attribute_value === "string"
              ? await teamMembersRepo.countWithConstraints({
                  attribute_value: payload.attribute_value,
                  team_uuid: payload.team_uuid,
                })
              : -1;

          return count === 0 ? true : false;
        },
      },
    },
  };

  await validator(payload, constraints2);
};

const handle = async ({ prepareResult, augmentPrepareResult, storyName }) => {
  try {
    await validateInput(prepareResult);

    let payload = {
      team_uuid: prepareResult.team_uuid,
      attribute_type: prepareResult.attribute_type,
      attribute_value: prepareResult.attribute_value,
      status: "invited",
      role_uuid: prepareResult.role_uuid,
      permissions: prepareResult.permissions,
      // user_uuid: prepareResult.invoking_user_uuid,
    };

    return await teamMembersRepo.createTeamMember(payload);
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
