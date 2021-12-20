// const getUser = requireFunction("getUser");
const teamMemberRepo = requireRepo("teamMembers");
const usersRepo = requireRepo("users");
const attributesRepo = requireRepo("attributes");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const knex = requireKnex();
const underscoredColumns = requireUtil("underscoredColumns");

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

    console.log("userAllAttributes", userAllAttributes);

    if (!userAllAttributes || userAllAttributes.length === 0) {
      throw userAllAttributes;
    }

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

    let joinValue = "VALUES ";

    for (let i = 0; i < attributes.length; i++) {
      let attributeValue = `('${attributes[i].type}', '${attributes[i].value}')`;
      let endingComma = ", ";

      // let columnDef =
      //   " AS t (p,o) ON p = attribute_type AND o = attribute_value";

      if (i !== attributes.length - 1) {
        joinValue = joinValue + attributeValue + endingComma;
      } else {
        joinValue = joinValue + attributeValue;
      }
    }

    console.log(joinValue);

    // const data = await knex.schema.raw(`SELECT * FROM team_members
    // JOIN (${joinValue}) AS t (p,o) ON p = attribute_type AND o = attribute_value JOIN teams ON team_members.team_uuid = teams.uuid`);

    // console.log("data", data.rows);
    // return data.rows;
    const d = await knex
      .from("team_members")
      .joinRaw(
        `JOIN (${joinValue}) AS t (p,o) ON p = attribute_type AND o = attribute_value`
      )
      .join("teams", "teams.uuid", "=", "team_members.team_uuid")
      .select(
        underscoredColumns([
          "teams.uuid",
          "teams.name",
          "teams.slug",
          "teams.tenant",
          "team_members.uuid",
          "team_members.user_uuid",
          "team_members.attribute_type",
          "team_members.attribute_value",
          "team_members.status",
          "team_members.role_uuid",
          "team_members.permissions",
        ])
      );

    console.log("d1121", d);

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
