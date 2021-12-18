exports.up = async function (knex) {
  return knex.schema.createTable("roles", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));

    table.uuid("owner_uuid").notNullable();
    table.string("owner_type", 255).nullable();
    table.string("title", 255).nullable();
    table.jsonb("permissions", 255).nullable().defaultTo(null);

    table.datetime("created_at", { useTz: false });
    table.datetime("updated_at", { useTz: false });
    table.datetime("deleted_at", { useTz: false });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("roles");
};
