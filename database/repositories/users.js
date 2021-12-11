const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const generateOTP = requireFunction("generateOTP");
const table = "users";

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const authenticateWithPassword = async (payload) => {
  let attribute = await attributesRepo.first({
    type: payload.type,
    value: payload.value,
  });

  let user = await baseRepo.first(table, {
    uuid: attribute.user_uuid,
  });

  const result = bcrypt.compareSync(payload.password, user.password);

  if (result) {
    return user;
  } else {
    throw {
      statusCode: 401,
      message: "Invalid Username or Password",
    };
  }
};

const verifyTokenForAttribute = async (payload) => {
  try {
    let verification = await verificationsRepo.first({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    console.log("verifyTokenForAttribute", verification);

    if (verification !== undefined && verification.purpose === "register") {
      if (payload.token === verification.token) {
        await attributesRepo.create({
          user_uuid: verification.user_uuid,
          verified_at: new Date().toISOString(),
          type: payload.type,
          value: payload.value,
        });
        await verificationsRepo.remove({
          uuid: verification.uuid,
        });
      } else {
        throw {
          statusCode: 401,
          message: "Invalid Token",
        };
      }
    }
  } catch (error) {
    throw error;
  }
};

const registerWithPassword = async (payload) => {
  let verification = await verificationsRepo.first({
    attribute_type: payload.type,
    attribute_value: payload.value,
    purpose: "register",
  });

  if (verification === undefined) {
    let user = await baseRepo.create(table, {
      password: bcrypt.hashSync(payload.password, 5),
    });

    await verificationsRepo.create({
      user_uuid: user.uuid,
      attribute_type: payload.type,
      attribute_value: payload.value,
      token: generateOTP(),
      purpose: "register",
      expires_at: new Date(new Date().getTime() + 10 * 60000).toISOString(),
    });

    return user;
  } else {
    let user = await baseRepo.first(table, {
      uuid: verification.user_uuid,
    });

    await verificationsRepo.update(
      { uuid: verification.uuid },
      {
        token: generateOTP(),
        expires_at: new Date(new Date().getTime() + 10 * 60000).toISOString(),
      }
    );

    return user;
  }
};

module.exports = {
  registerWithPassword,
  authenticateWithPassword,
  verifyTokenForAttribute,
  countAll,
};
