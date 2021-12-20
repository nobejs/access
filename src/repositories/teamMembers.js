const knex = requireKnex();
const underscoredColumns = requireUtil("underscoredColumns");
const attributesRepo = requireRepo("attributes");

const countWithConstraints = async (where = {}, whereNot = {}) => {
  try {
    let team_members = await knex("team_members")
      .where(where)
      .whereNot(whereNot)
      .whereNull("deleted_at")
      .count({ count: "*" })
      .first();
    return parseInt(team_members.count);
  } catch (error) {
    throw error;
  }
};

const findAll = async (where = {}) => {
  try {
    let teams = await knex("team_members")
      .where(where)
      .whereNull("deleted_at")
      .select("*");
    return teams;
  } catch (error) {
    throw error;
  }
};

const getTeamsAndMembers = async (where = {}) => {
  try {
    let memberships = await knex("teams")
      .join("team_members", "teams.uuid", "=", "team_members.team_uuid")
      .where(where)
      .whereNull("team_members.deleted_at")
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

    return memberships;
  } catch (error) {
    throw error;
  }
};

const findWithConstraints = async (where = {}) => {
  try {
    let team_members = await knex("team_members")
      .where(where)
      .whereNull("deleted_at")
      .first();
    return team_members;
  } catch (error) {
    throw error;
  }
};

const createTeamMember = async (payload) => {
  try {
    payload["created_at"] = new Date().toISOString();
    payload["updated_at"] = new Date().toISOString();
    let team_members = await knex("team_members")
      .insert(payload)
      .returning("*");
    return team_members[0];
  } catch (error) {
    throw error;
  }
};

const update = async (member_uuid, payload) => {
  try {
    payload["updated_at"] = new Date().toISOString();
    let team = await knex("team_members")
      .where("uuid", "=", member_uuid)
      .update(payload)
      .returning("*");
    return team[0];
  } catch (error) {
    throw error;
  }
};

const del = async (where) => {
  try {
    let team = await knex("team_members").where(where).update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return team[0];
  } catch (error) {
    throw error;
  }
};

const getUserTeamInvites = async (userUuid) => {
  try {
    let userAllAttributes = await attributesRepo.findWithConstraints(
      {
        user_uuid: userUuid,
      },
      ["user_uuid", "type", "value"]
    );

    if (!userAllAttributes || userAllAttributes.length === 0) {
      throw userAllAttributes;
    }

    let attributes = userAllAttributes.map((a) => {
      return `('${a.type}','${a.value}')`;
    });

    const data = await knex
      .from("team_members")
      .joinRaw(
        `JOIN (VALUES ${attributes.join(
          ", "
        )}) AS t (p,o) ON p = attribute_type AND o = attribute_value`
      )
      .join("teams", "teams.uuid", "=", "team_members.team_uuid")
      .where({ status: "invited" })
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

    console.log("data231", data);

    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTeamMember,
  update,
  findWithConstraints,
  countWithConstraints,
  findAll,
  del,
  getTeamsAndMembers,
  getUserTeamInvites,
};
