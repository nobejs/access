var slugify = require("slugify");
const knex = requireKnex();

async function generateSlug(resourceSpec, identifier, s) {
  const slug = slugify(s);
  let count = await knex(resourceSpec.meta.table)
    .where(knex.raw(`LOWER(${identifier})`), "LIKE", `${slug.toLowerCase()}%`)
    .count({ count: "*" })
    .first();
  count = parseInt(count.count);
  return count === 0 ? slug : `${slug}-${count}`;
}

module.exports = generateSlug;
