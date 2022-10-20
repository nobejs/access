exports.up = function (knex) {
  return knex.schema.alterTable("teams", function (table) {
    table.uuid("creator_user_uuid").nullable().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("teams", function (table) {
    table.uuid("creator_user_uuid").notNullable().alter();
  });
};
