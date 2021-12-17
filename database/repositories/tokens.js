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
  try {
    console.log("createTokenForUser", user.uuid);
    let token = await baseRepo.create(table, {
      sub: user.uuid,
      issuer: "user",
    });
    let jwt = await generateJWT(token.uuid, token.sub);
    return jwt;
  } catch (error) {
    throw error;
  }
};

const checkIfValidJti = async (jti) => {
  try {
    let token = await baseRepo.first(table, {
      uuid: jti,
    });

    if (token === undefined) {
      throw {
        message: "Invalid JTI",
      };
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  first,
  countAll,
  update,
  remove,
  createTokenForUser,
  checkIfValidJti,
};
