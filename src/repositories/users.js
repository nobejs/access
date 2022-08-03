const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const tokensRepo = requireRepo("tokens");
const {
  registrationVerificationEvent,
  updateVerificationEvent,
  resetPasswordVerificationEvent,
  loginWithOtpEvent,
} = require("../events");
const isDateInPast = requireFunction("isDateInPast");
const table = "users";

const getAllowedTypes = () => {
  return ["email", "mobile_number"];
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

const findUserByTypeAndValue = async (where = {}, whereNot = {}) => {
  // console.log("findUserByTypeAndValue", where, whereNot);
  return await baseRepo.countAll("attributes", where, whereNot);
};

const create = async (payload) => {
  return await baseRepo.create(table, payload);
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
};

const generateOTPForLogin = async (payload) => {
  let attribute = await attributesRepo.first({
    type: payload.type,
    value: payload.value,
  });

  let verification = await verificationsRepo.findVerificationForRegistration({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  if (attribute === undefined && verification !== undefined) {
    throw {
      statusCode: 422,
      message: "AttributeNotVerified",
    };
  }

  if (attribute === undefined && verification === undefined) {
    throw {
      statusCode: 422,
      message: "AttributeNotRegistered",
    };
  }

  let user = await baseRepo.first(table, {
    uuid: attribute.user_uuid,
  });

  verification = await verificationsRepo.findVerificationForLogin({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  if (verification !== undefined) {
    let verificationObject = await verificationsRepo.updateVerification({
      uuid: verification.uuid,
    });

    await loginWithOtpEvent({
      user_uuid: verificationObject.user_uuid,
      token: verificationObject.token,
      type: verificationObject.attribute_type,
      value: verificationObject.attribute_value,
      contact_infos: [
        {
          type: payload.type,
          value: verificationObject.attribute_value,
        },
      ],
    });
  } else {
    let attribute = await attributesRepo.first({
      type: payload.type,
      value: payload.value,
    });

    let verificationObject = await verificationsRepo.createVerificationForLogin(
      {
        user_uuid: attribute.user_uuid,
        attribute_type: payload.type,
        attribute_value: payload.value,
      }
    );

    await loginWithOtpEvent({
      user_uuid: verificationObject.user_uuid,
      token: verificationObject.token,
      type: verificationObject.attribute_type,
      value: verificationObject.attribute_value,
      contact_infos: [
        {
          type: payload.type,
          value: verificationObject.attribute_value,
        },
      ],
    });
  }
};

const authenticateWithOTP = async (payload) => {
  try {
    let testUserAccounts = [];
    let testPassword = process.env.TEST_USER_PASSWORD || "123456";

    if (process.env.TEST_USER_ACCOUNTS !== undefined) {
      testUserAccounts = process.env.TEST_USER_ACCOUNTS.split(",");
    }

    let attribute = await attributesRepo.first({
      type: payload.type,
      value: payload.value,
    });

    let verification = await verificationsRepo.findVerificationForRegistration({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    if (attribute === undefined && verification !== undefined) {
      throw {
        statusCode: 422,
        message: "AttributeNotVerified",
      };
    }

    if (attribute === undefined && verification === undefined) {
      throw {
        statusCode: 422,
        message: "AttributeNotRegistered",
      };
    }

    verification = await verificationsRepo.findVerificationForLogin({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (
        payload.token === verification.token ||
        (testUserAccounts.includes(verification.user_uuid) &&
          payload.token === testPassword)
      ) {
        let user = await baseRepo.first(table, {
          uuid: attribute.user_uuid,
        });

        await verificationsRepo.removeVerification({
          uuid: verification.uuid,
        });

        let token = await tokensRepo.createTokenForUser(user);
        return token;
      } else {
        throw {
          statusCode: 422,
          message: "Invalid Token",
        };
      }
    } else {
      throw {
        statusCode: 422,
        message: "Invalid Token",
      };
    }
  } catch (error) {
    throw {
      statusCode: 422,
      message: "Invalid Token",
    };
  }
};

const authenticateWithPassword = async (payload) => {
  let testUserAccounts = [];
  let testPassword = process.env.TEST_USER_PASSWORD || "123456";

  if (process.env.TEST_USER_ACCOUNTS !== undefined) {
    testUserAccounts = process.env.TEST_USER_ACCOUNTS.split(",");
  }

  let attribute = await attributesRepo.first({
    type: payload.type,
    value: payload.value,
  });

  let verification = await verificationsRepo.findVerificationForRegistration({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  if (attribute === undefined && verification !== undefined) {
    throw {
      statusCode: 422,
      message: "AttributeNotVerified",
    };
  }

  if (attribute === undefined && verification === undefined) {
    throw {
      statusCode: 422,
      message: "AttributeNotRegistered",
    };
  }

  let user = await baseRepo.first(table, {
    uuid: attribute.user_uuid,
  });

  let result = bcrypt.compareSync(payload.password, user.password);

  if (
    testUserAccounts.includes(attribute.user_uuid) &&
    payload.password === testPassword
  ) {
    result = true;
  }

  console.log("result", result);

  if (result) {
    let token = await tokensRepo.createTokenForUser(user);
    return token;
  } else {
    throw {
      statusCode: 422,
      message: "Invalid Username or Password",
    };
  }
};

const registerUserFromGoogle = async (payload) => {
  try {
    const findUserWithAttribute = await attributesRepo.first({
      type: "email",
      value: payload.email,
    });

    // console.log("findUserWithAttribute", findUserWithAttribute);

    if (findUserWithAttribute === undefined) {
      const user = await baseRepo.create(table, {
        profile: {
          name: payload.name,
        },
      });

      // console.log("createUser", user);

      await attributesRepo.createAttributeForUUID(
        user.uuid,
        {
          type: "email",
          value: payload.email,
        },
        true
      );

      let token = await tokensRepo.createTokenForUser(user);
      return token;
    } else {
      let user = await baseRepo.first(table, {
        uuid: findUserWithAttribute.user_uuid,
      });

      let token = await tokensRepo.createTokenForUser(user);
      return token;
    }
  } catch (error) {}
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
        user_uuid: verificationObject.user_uuid,
        token: verificationObject.token,
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
        contact_infos: [
          {
            type: payload.type,
            value: verificationObject.attribute_value,
          },
        ],
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

const requestAttributeVerificationForUpdate = async (payload) => {
  try {
    // Find if there is already an existing verification for this
    let verification = await verificationsRepo.findVerificationForUpdate({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    // If verification is present already, we can update it
    if (verification !== undefined) {
      let verificationObject = await verificationsRepo.updateVerification({
        uuid: verification.uuid,
      });

      await updateVerificationEvent({
        user_uuid: verificationObject.user_uuid,
        token: verificationObject.token,
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
        purpose: payload.purpose,
        contact_infos: [
          {
            type: payload.type,
            value: verificationObject.attribute_value,
          },
        ],
      });
    } else {
      throw {
        statusCode: 422,
        message: "Not requested yet",
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
      statusCode: 422,
      message: "Invalid Token",
    };
  }
};

const requestAttributeVerificationForResetPassword = async (payload) => {
  try {
    // Find if there is already an existing verification for this
    let verification = await verificationsRepo.findVerificationForResetPassword(
      {
        attribute_type: payload.type,
        attribute_value: payload.value,
      }
    );

    // If verification is present already, we can update it
    if (verification !== undefined) {
      let verificationObject = await verificationsRepo.updateVerification({
        uuid: verification.uuid,
      });

      await resetPasswordVerificationEvent({
        user_uuid: verificationObject.user_uuid,
        token: verificationObject.token,
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
        contact_infos: [
          {
            type: payload.type,
            value: verificationObject.attribute_value,
          },
        ],
      });
    } else {
      let attribute = await attributesRepo.first({
        type: payload.type,
        value: payload.value,
      });

      let verificationObject =
        await verificationsRepo.createVerificationForResetPassword({
          user_uuid: attribute.user_uuid,
          attribute_type: payload.type,
          attribute_value: payload.value,
        });

      await resetPasswordVerificationEvent({
        user_uuid: verificationObject.user_uuid,
        token: verificationObject.token,
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
        contact_infos: [
          {
            type: "email",
            value: verificationObject.attribute_value,
          },
        ],
      });
    }
  } catch (error) {
    throw error;
  }
};

const verifyAttributeForResetPassword = async (payload) => {
  try {
    let verification = await verificationsRepo.findVerificationForResetPassword(
      {
        attribute_type: payload.type,
        attribute_value: payload.value,
      }
    );

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (payload.token === verification.token) {
        await updateUserPassword(verification.user_uuid, payload.password);

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
      statusCode: 422,
      message: "Invalid Token",
    };
  }
};

const updateUserPassword = async (uuid, password) => {
  return await baseRepo.update(
    table,
    { uuid: uuid },
    {
      password: bcrypt.hashSync(password, 5),
    }
  );
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
    user_uuid: verificationObject.user_uuid,
    token: verificationObject.token,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
    contact_infos: [
      {
        type: payload.type,
        value: verificationObject.attribute_value,
      },
    ],
  });

  return verification;
};

const updateAttribute = async (payload) => {
  // Find if there is already a registration in process

  let verification = await verificationsRepo.findVerificationForUpdate({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  let verificationObject = null;

  if (verification === undefined) {
    verificationObject = await verificationsRepo.createVerificationForUpdate({
      user_uuid: payload.sub,
      attribute_type: payload.type,
      attribute_value: payload.value,
    });
  } else {
    // If there is a verification, update verification with new token and timestamp

    verificationObject = await verificationsRepo.updateVerification({
      uuid: verification.uuid,
    });
  }

  await updateVerificationEvent({
    user_uuid: verificationObject.user_uuid,
    token: verificationObject.token,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
    purpose: payload.purpose,
    contact_infos: [
      {
        type: payload.type,
        value: verificationObject.attribute_value,
      },
    ],
  });

  return verification;
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

const updateProfileOfUser = async (uuid, payload) => {
  return await baseRepo.update(table, { uuid: uuid }, { profile: payload });
};

const verifyAttributeForUpdate = async (payload) => {
  try {
    let verification = await verificationsRepo.findVerificationForUpdate({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    console.log("payload", payload.token === verification.token);

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (payload.token === verification.token) {
        // console.log("payload", payload);

        const existingAttribute = await attributesRepo.first({
          user_uuid: payload.sub,
          type: payload.type,
          ...(payload.purpose && { purpose: payload.purpose }),
        });

        // console.log("existingAttribute", existingAttribute);

        if (existingAttribute === undefined) {
          await attributesRepo.createAttributeForUUID(
            verification.user_uuid,
            {
              type: payload.type,
              value: payload.value,
              ...(payload.purpose && { purpose: payload.purpose }),
            },
            true
          );
        } else {
          await attributesRepo.update(
            {
              uuid: existingAttribute.uuid,
            },
            {
              type: payload.type,
              value: payload.value,
              ...(payload.purpose && { purpose: payload.purpose }),
            }
          );
        }

        await verificationsRepo.removeVerification({
          uuid: verification.uuid,
        });

        return {
          message: "Verification Successful",
        };
      } else {
        throw "Token didn't match";
      }
    } else {
      throw "Verification doesn't exist or is in past";
    }
  } catch (error) {
    console.log("Error", error);

    throw {
      statusCode: 422,
      message: "Invalid Token",
    };
  }
};

module.exports = {
  getAllowedTypes,
  createUserWithPassword,
  registerWithPassword,
  authenticateWithPassword,
  requestAttributeVerificationForRegistration,
  verifyAttributeForRegistration,
  requestAttributeVerificationForResetPassword,
  verifyAttributeForResetPassword,
  findUserByTypeAndValue,
  create,
  first,
  createTestUserWithVerifiedToken,
  updateProfileOfUser,
  registerUserFromGoogle,
  generateOTPForLogin,
  authenticateWithOTP,
  updateUserPassword,
  updateAttribute,
  requestAttributeVerificationForUpdate,
  verifyAttributeForUpdate,
};
