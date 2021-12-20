// const getUser = requireFunction("getUser");
const teamMemberRepo = requireRepo("teamMembers");
const usersRepo = requireRepo("users");
const attributesRepo = requireRepo("attributes");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const knex = requireKnex();

const prepare = ({ req }) => {
  try {
    const payload = findKeysFromRequest(req, ["tenant"]);
    payload["invoking_user_uuid"] = req.sub;

    return payload;
  } catch (error) {
    throw error;
  }
};

const augmentPrepare = async ({ prepareResult }) => {
  let user = {};

  try {
    user = await usersRepo.first({ uuid: prepareResult["invoking_user_uuid"] });
    if (user === undefined) {
      throw user;
    }

    let userAllAttributes = await attributesRepo.findWithConstraints(
      {
        user_uuid: user.uuid,
      },
      ["user_uuid", "type", "value"]
    );

    if (!userAllAttributes || userAllAttributes.length === 0) {
      throw userAllAttributes;
    }

    console.log("userAllAttributes12312", userAllAttributes);

    return { user, userAllAttributes };
  } catch (error) {
    console.log("error123", error);
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }
};

const authorize = () => {
  return true;
};

const handle = async ({ prepareResult, augmentPrepareResult }) => {
  try {
    let attributes = augmentPrepareResult.userAllAttributes;

    console.log("attributes1122", attributes);

    let joinValue = "VALUES ";

    for (let i = 0; i < attributes.length; i++) {
      let attributeValue = `('${attributes[i].type}', '${attributes[i].value}')`;
      let endingComma = ", ";

      let columnDef =
        " AS t (p,o) ON p = attribute_type AND o = attribute_value";

      if (i !== attributes.length - 1) {
        joinValue = joinValue + attributeValue + endingComma;
      } else {
        joinValue = joinValue + attributeValue;
      }
    }

    console.log("test123", joinValue);

    const data = await knex.schema.raw(`SELECT * FROM team_members
    JOIN (${joinValue}) AS t (p,o) ON p = attribute_type AND o = attribute_value`);

    // console.log("data", data.rows);
    return data.rows;
    // const d = await knex
    //   .select("*")
    //   .from("team_members")
    //   .joinRaw(`${joinValue}`);
    // console.log("d1121", d);

    // return await teamMemberRepo.getTeamsAndMembers({
    //   "teams.tenant": prepareResult["tenant"],
    //   "team_members.user_uuid": augmentPrepareResult.user.uuid,
    //   "team_members.status": "invited",
    // });
  } catch (error) {
    throw error;
  }
};

const respond = ({ handleResult }) => {
  try {
    return handleResult;
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
