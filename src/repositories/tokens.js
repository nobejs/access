const baseRepo = requireUtil("baseRepo");
const generateJWT = requireFunction("JWT/generateJWT");
const table = "tokens";
const underscoredColumns = requireUtil("underscoredColumns");
const contextClassRef = requireUtil("contextHelper");

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const create = async (payload) => {
  return await baseRepo.create(table, payload);
};

const findAllUserTokens = async (uuid) => {
  return await baseRepo.findAll(
    table,
    { sub: uuid, issuer: "user" },
    underscoredColumns([
      "tokens.uuid",
      "tokens.title",
      "tokens.issuer",
      "tokens.permissions",
      "tokens.created_at",
      "tokens.updated_at",
      "tokens.other_info",
    ])
  );
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
};

const update = async (where, payload) => {
  return await baseRepo.update(table, where, payload);
};

const deleteTokenByConstraints = async (payload) => {
  return await baseRepo.remove(table, payload, "hard");
};

const createTokenForUser = async (user) => {
  try {
    let token = await baseRepo.create(table, {
      sub: user.uuid,
      issuer: "user",
      other_info: {
        client: contextClassRef.client,
      },
    });
    let jwt = await generateJWT(token.uuid, token.sub, token.issuer);
    return jwt;
  } catch (error) {
    throw error;
  }
};

const createTokenForAdmin = async (admin) => {
  try {
    let token = await baseRepo.create(table, {
      sub: admin.uuid,
      issuer: "admin",
      other_info: {
        client: contextClassRef.client,
      },
    });
    let jwt = await generateJWT(token.uuid, token.sub, token.issuer);
    return jwt;
  } catch (error) {
    throw error;
  }
};

const createTokenForTeam = async (payload) => {
  try {
    let token = await baseRepo.create(table, {
      sub: payload.team_uuid,
      issuer: "team",
      permissions: payload.permissions,
      title: payload.title,
    });
    let jwt = await generateJWT(token.uuid, token.sub, token.issuer);
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

const getTokensForTeam = async (payload) => {
  try {
    return await baseRepo.findAll(
      table,
      {
        sub: payload.team_uuid,
        issuer: "team",
      },
      underscoredColumns([
        "tokens.uuid",
        "tokens.title",
        "tokens.permissions",
        "tokens.created_at",
        "tokens.updated_at",
      ])
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  first,
  countAll,
  update,
  deleteTokenByConstraints,
  createTokenForUser,
  createTokenForAdmin,
  createTokenForTeam,
  checkIfValidJti,
  getTokensForTeam,
  findAllUserTokens,
};
