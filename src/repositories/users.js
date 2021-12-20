const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const tokensRepo = requireRepo("tokens");
const { registrationVerificationEvent } = require("../events");
const isDateInPast = requireFunction("isDateInPast");
const table = "users";

const getAllowedTypes = () => {
  return ["email"];
};

// const getAttributesOfAUser = (user_uuid) => {
//   try {
//     return await attributesRepo.findAll({
//       user_uuid: user_uuid,
//     });
//   } catch (error) {
//     throw error;
//   }
// };

const findUserByTypeAndValue = async (where = {}) => {
  return await baseRepo.countAll("attributes", where);
};

const create = async (payload) => {
  return await baseRepo.create(table, payload);
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
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

  // console.log(
  //   "What happened to compare password?",
  //   result,
  //   payload.password,
  //   user.password
  // );

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
    let verification = await verificationsRepo.findVerificationForRegistration({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    // If verification is present already, we can update it
    if (verification !== undefined) {
      let verificationObject = await verificationsRepo.updateVerification({
        uuid: verification.uuid,
      });

      await registrationVerificationEvent({
        token: verificationObject.token,
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
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
    let verification = await verificationsRepo.findVerificationForRegistration({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (payload.token === verification.token) {
        await attributesRepo.createAttributeForUUID(
          verification.user_uuid,
          payload,
          true
        );
        await verificationsRepo.removeVerification({
          uuid: verification.uuid,
        });

        return {
          message: "Verification Successful",
        };
      } else {
        throw "err";
      }
    } else {
      throw "err";
    }
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Invalid Token",
    };
  }
};

const createUserWithPassword = async (password) => {
  return await baseRepo.create(table, {
    password: bcrypt.hashSync(password, 5),
  });
};

const registerWithPassword = async (payload) => {
  // Find if there is already a registration in process

  let verification = await verificationsRepo.findVerificationForRegistration({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  let user = null;
  let verificationObject = null;

  if (verification === undefined) {
    // If no, create a user and also verification for them
    user = await createUserWithPassword(payload.password);

    verificationObject =
      await verificationsRepo.createVerificationForRegistration({
        user_uuid: user.uuid,
        attribute_type: payload.type,
        attribute_value: payload.value,
      });
  } else {
    // If there is a verification, update verification with new token and timestamp

    verificationObject = await verificationsRepo.updateVerification({
      uuid: verification.uuid,
    });
  }

  await registrationVerificationEvent({
    token: verificationObject.token,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
  });

  return true;
};

const createTestUserWithVerifiedToken = async (payload) => {
  try {
    let user = await createUserWithPassword(payload.password);
    await attributesRepo.createAttributeForUUID(user.uuid, payload, true);
    let token = await tokensRepo.createTokenForUser(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllowedTypes,
  createUserWithPassword,
  registerWithPassword,
  authenticateWithPassword,
  verifyAttributeForRegistration,
  requestAttributeVerificationForRegistration,
  findUserByTypeAndValue,
  create,
  first,
  createTestUserWithVerifiedToken,
  // getAttributesOfAUser,
};
