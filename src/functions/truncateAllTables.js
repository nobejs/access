const knex = requireKnex();

module.exports = async () => {
  await knex("users").truncate();
  await knex("verifications").truncate();
  await knex("tokens").truncate();
  await knex("attributes").truncate();
  await knex("teams").truncate();
  await knex("team_members").truncate();
  await knex("roles").truncate();
};
