const baseRepo = requireUtil("baseRepo");
const table = "tokens";

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const create = async (payload) => {
  return await baseRepo.create(table, payload);
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
};

const update = async (where, payload) => {
  return await baseRepo.update(table, where, payload);
};

const remove = async (payload) => {
  return await baseRepo.remove(table, payload, "hard");
};

const createTokenForUser = async (payload) => {
  return await baseRepo.remove(table, payload, "hard");
};

module.exports = {
  create,
  first,
  countAll,
  update,
  remove,
  createTokenForUser,
};
