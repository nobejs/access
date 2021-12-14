exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("tokens", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("of_uuid");
    table.string("of_type", 255);
    table.string("title", 255);
    table.json("abilities");
    table.datetime("expires_at", { useTz: false });
    table.datetime("created_at", { useTz: false });
    table.datetime("updated_at", { useTz: false });
    table.datetime("deleted_at", { useTz: false });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tokens");
};
