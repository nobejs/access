const knex = require("../knex");
const { addCreatedTimestamps } = require("./helper");
const baseRepo = requireUtil("baseRepo");
const table = "teams";

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table);
};

const create = async (payload) => {
  try {
    payload = baseRepo.addCreatedTimestamps(payload);

    let result = await knex.transaction(async (trx) => {
      const teams = await trx("teams").insert(payload).returning("*");
      const teamMemberPayload = baseRepo.addCreatedTimestamps({
        user_uuid: payload.creator_user_uuid,
        team_uuid: teams[0]["uuid"],
        status: "accepted",
        role: "owner",
      });
      await trx("team_members").insert(teamMemberPayload);
      return teams[0];
    });
    return result;
  } catch (error) {
    throw error;
  }
};

const fetchTeamsFromUuids = async (teamUuids) => {
  try {
    let teams = await knex("teams").whereIn("uuid", teamUuids).returning("*");
    return teams;
  } catch (error) {
    throw error;
  }
};

const first = async (where = {}) => {
  return await baseRepo.first(table, where);
};

const update = async (team_uuid, payload) => {
  try {
    payload["updated_at"] = new Date().toISOString();
    let team = await knex("teams")
      .where("uuid", "=", team_uuid)
      .update(payload)
      .returning("*");
    return team[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  first,
  update,
  countAll,
  fetchTeamsFromUuids,
};
