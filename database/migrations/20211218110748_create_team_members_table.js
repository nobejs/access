exports.up = async function (knex) {
  return knex.schema.createTable("team_members", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("team_uuid").notNullable();
    table.uuid("user_uuid").nullable();
    table.string("attribute_type", 255).nullable();
    table.string("attribute_value", 255).nullable();
    table.string("status", 255).notNullable().defaultTo("invited");
    table.string("role_uuid", 255).nullable().defaultTo(null);
    table.jsonb("permissions", 255).nullable().defaultTo(null);
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("team_members");
};
