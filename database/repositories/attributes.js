const baseRepo = requireUtil("baseRepo");
const table = "attributes";

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const create = async (payload) => {
  return await baseRepo.create(table, payload);
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
};

module.exports = {
  create,
  first,
  countAll,
};
