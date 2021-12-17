const baseRepo = requireUtil("baseRepo");
const generateJWT = requireFunction("JWT/generateJWT");
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

const createTokenForUser = async (user) => {
  let token = await baseRepo.create(table, {
    sub: user.uuid,
    issuer: "user",
  });
  let jwt = generateJWT(token.uuid, token.sub);
  return jwt;
};

module.exports = {
  create,
  first,
  countAll,
  update,
  remove,
  createTokenForUser,
};
