const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const tokensRepo = requireRepo("tokens");
const { registrationVerificationEvent } = require("../events");
const { getMinutesFromNow, generateOTP } = require("../utils");
const table = "users";

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

const authenticateWithPassword = async (payload) => {
  let attribute = await attributesRepo.first({
    type: payload.type,
    value: payload.value,
  });

  if (attribute === undefined) {
    throw {
      statusCode: 401,
      message: "Invalid Username or Password",
    };
  }

  let user = await baseRepo.first(table, {
    uuid: attribute.user_uuid,
  });

  const result = bcrypt.compareSync(payload.password, user.password);

  if (result) {
    let token = await tokensRepo.createTokenForUser(user);
    return token;
  } else {
    throw {
      statusCode: 401,
      message: "Invalid Username or Password",
    };
  }
};

const requestAttributeVerificationForRegistration = async (payload) => {
  try {
    // Find if there is already an existing verification for this
    let verification = await verificationsRepo.first({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    // If verification is present already, we can update it
    if (verification !== undefined && verification.purpose === "register") {
      let token = generateOTP();
      await verificationsRepo.update(
        { uuid: verification.uuid },
        {
          token: token,
          expires_at: getMinutesFromNow(10),
        }
      );

      await registrationVerificationEvent({
        token,
        type: payload.type,
        value: payload.value,
      });
    } else {
      throw {
        statusCode: 422,
        message: "Not registered yet",
      };
    }
  } catch (error) {
    throw error;
  }
};

const verifyAttributeForRegistration = async (payload) => {
  try {
    let verification = await verificationsRepo.first({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    if (verification !== undefined && verification.purpose === "register") {
      if (payload.token === verification.token) {
        await attributesRepo.createAttributeForUUID(
          verification.user_uuid,
          payload,
          true
        );
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

const createUserWithPassword = async (password) => {
  return await baseRepo.create(table, {
    password: password, //bcrypt.hashSync(password, 5),
  });
};

const registerWithPassword = async (payload) => {
  // Find if there is already a registration in process

  let verification = await verificationsRepo.first({
    attribute_type: payload.type,
    attribute_value: payload.value,
    purpose: "register",
  });

  let user = null;
  let token = generateOTP();

  if (verification === undefined) {
    // If no, create a user and also verification for them
    user = await createUserWithPassword(payload.password);

    await verificationsRepo.create({
      user_uuid: user.uuid,
      attribute_type: payload.type,
      attribute_value: payload.value,
      token: token,
      purpose: "register",
      expires_at: getMinutesFromNow(10),
    });
  } else {
    // If there is a verification, update verification with new token and timestamp

    await verificationsRepo.update(
      { uuid: verification.uuid },
      {
        token: token,
        expires_at: getMinutesFromNow(10),
      }
    );
  }

  await registrationVerificationEvent({
    token,
    type: payload.type,
    value: payload.value,
  });

  return true;
};

module.exports = {
  createUserWithPassword,
  registerWithPassword,
  authenticateWithPassword,
  verifyAttributeForRegistration,
  requestAttributeVerificationForRegistration,
  countAll,
  create,
  first,
};
