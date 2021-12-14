const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const { registrationVerificationEvent } = require("../events");
const { getMinutesFromNow, generateOTP } = require("../utils");
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
    user = await baseRepo.create(table, {
      password: bcrypt.hashSync(payload.password, 5),
    });

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
  registerWithPassword,
  authenticateWithPassword,
  verifyAttributeForRegistration,
  requestAttributeVerificationForRegistration,
  countAll,
};
