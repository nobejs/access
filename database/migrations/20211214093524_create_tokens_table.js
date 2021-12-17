exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("tokens", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("sub");
    table.string("issuer", 255);
    table.string("title", 255);
    table.json("permissions");
    table.json("other_info");
    table.datetime("created_at", { useTz: false });
    table.datetime("updated_at", { useTz: false });
    table.datetime("deleted_at", { useTz: false });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tokens");
};
