exports.up = function (knex) {
  return knex.schema.alterTable("attributes", function (table) {
    table.string("purpose", 255);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("attributes", function (table) {
    table.dropColumn("purpose");
  });
};
