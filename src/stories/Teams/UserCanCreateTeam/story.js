const validator = requireValidator();
const teamRepo = requireRepo("teams");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const teamSerializer = requireSerializer("teams");

const prepare = ({ req }) => {
  const payload = findKeysFromRequest(req, ["tenant", "name", "slug"]);
  payload["creator_user_uuid"] = req.sub;
  payload["issuer"] = req.issuer;
  return payload;
};

const authorize = ({ prepareResult }) => {
  if (prepareResult.issuer !== "user") {
    throw {
      statusCode: 403,
      message: "Forbidden",
    };
  }

  return true;
};

const validateInput = async (prepareResult) => {
  const constraints = {
    creator_user_uuid: {
      presence: {
        allowEmpty: false,
        message: "^Please enter creator_user_uuid",
      },
    },
    tenant: {
      presence: {
        allowEmpty: false,
        message: "^Please enter tenant",
      },
    },
    name: {
      presence: {
        allowEmpty: false,
        message: "^Please enter name",
      },
    },
    slug: {
      presence: {
        allowEmpty: false,
        message: "^Please enter slug",
      },
      type: "string",
      custom_callback: {
        message: "Slug should be unique",
        callback: async (payload) => {
          let count =
            typeof payload.slug === "string"
              ? await teamRepo.countWithConstraints({
                  slug: prepareResult.slug,
                  tenant: prepareResult.tenant,
                })
              : -1;

          return count === 0 ? true : false;
        },
      },
    },
  };

  return validator(prepareResult, constraints);
};

const handle = async ({ prepareResult }) => {
  try {
    await validateInput(prepareResult);
    delete prepareResult.issuer;
    return await teamRepo.createTeamForAUser(prepareResult);
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return await teamSerializer.single(handleResult);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
