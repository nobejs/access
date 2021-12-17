exports.up = async function (knex) {
  return knex.schema.createTable("team_members", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("team_uuid").notNullable();
    table.uuid("user_uuid").nullable();
    table.string("email", 255).nullable();
    table.string("status", 255).notNullable().defaultTo("invited");
    table.string("role", 255).notNullable().defaultTo("member");
    table.datetime("created_at", { useTz: false });
    table.datetime("updated_at", { useTz: false });
    table.datetime("deleted_at", { useTz: false });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("team_members");
};
