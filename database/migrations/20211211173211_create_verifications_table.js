exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("verifications", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("user_uuid").notNullable();
    table.string("token", 255);
    table.string("attribute_type", 255);
    table.string("attribute_value", 255);
    table.string("purpose", 255);
    table.datetime("expires_at");
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("verifications");
};
