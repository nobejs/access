exports.up = function (knex) {
  return knex.schema.alterTable("teams", function (table) {
    table.jsonb("meta");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("teams", function (table) {
    table.dropColumn("meta");
  });
};
