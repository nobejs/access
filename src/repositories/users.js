const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const attributesRepo = requireRepo("attributes");
const verificationsRepo = requireRepo("verifications");
const tokensRepo = requireRepo("tokens");
const neptune = requireRepo("neptune");
const { resetPasswordVerificationEvent } = require("../events");
const eventBus = require("../eventBus");
const isDateInPast = requireFunction("isDateInPast");
const table = "users";

const getAllowedTypes = () => {
  return ["email", "mobile_number"];
};

const getAllowedVerificationMethods = () => {
  return ["otp", "link"];
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

/**  Registration - Start */

// When user registers with any attribute_type we use this method
// We also send verification code or link based on method via events
const registerWithPassword = async (payload, userProfile) => {
  // Find if there is already a registration in process

  let verification = await verificationsRepo.findVerificationForRegistration({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  let user = null;
  let verificationObject = null;

  if (verification === undefined) {
    // If no, create a user and also verification for them
    user = await createUserWithPassword(payload.password, userProfile);
    verificationObject =
      await verificationsRepo.createVerificationForRegistration({
        user_uuid: user.uuid,
        attribute_type: payload.type,
        attribute_value: payload.value,
      });

    await eventBus("user_created", {
      verificationObject: verificationObject,
      payload: payload,
    });
  } else {
    // If there is a verification, update verification with new token and timestamp

    verificationObject = await verificationsRepo.updateVerification({
      uuid: verification.uuid,
    });

    await eventBus("verification_requested_during_registration", {
      verificationObject: verificationObject,
      payload: payload,
    });
  }

  return verification;
};

// If user wants to get the verification code for registration
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

      await eventBus("verification_requested_during_registration", {
        verificationObject: verificationObject,
        payload: payload,
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

// This method is used to verify user using an OTP
const verifyAttributeForRegistrationUsingOTP = async (payload) => {
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

        let userObject = await baseRepo.first(table, {
          uuid: verification.user_uuid,
        });

        await eventBus("user_registered", {
          verificationObject: verification,
          userObject: userObject,
          payload: payload,
        });

        await verificationsRepo.removeVerification({
          uuid: verification.uuid,
        });

        let token = await tokensRepo.createTokenForUser(userObject);
        return token;
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

// The following method is verify user using a Link
const verifyAttributeForRegistrationUsingLink = async (payload) => {
  try {
    let verification = await verificationsRepo.findVerificationForRegistration({
      user_uuid: payload.user_uuid,
      token: payload.verification_code,
    });

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (payload.verification_code === verification.token) {
        let attribute = {
          type: verification.attribute_type,
          value: verification.attribute_value,
        };
        await attributesRepo.createAttributeForUUID(
          verification.user_uuid,
          attribute,
          true
        );

        let userObject = await baseRepo.first(table, {
          uuid: verification.user_uuid,
        });

        await eventBus("user_registered", {
          verificationObject: verification,
          userObject: userObject,
          payload: payload,
        });

        await verificationsRepo.removeVerification({
          uuid: verification.uuid,
        });

        return {
          success: true,
        };
      } else {
        throw "err";
      }
    } else {
      throw "err";
    }
  } catch (error) {
    return {
      success: false,
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

      await attributesRepo.createAttributeForUUID(
        user.uuid,
        {
          type: "email",
          value: payload.email,
        },
        true
      );

      let userObject = await baseRepo.first(table, {
        uuid: user.uuid,
      });

      // Todo: Test Login with Google
      await eventBus("user_registered", {
        verificationObject: {
          user_uuid: user.uuid,
          attribute_type: "email",
          attribute_value: payload.email,
        },
        userObject: userObject,
        payload: payload,
      });

      let token = await tokensRepo.createTokenForUser(user);
      return token;
    } else {
      let user = await baseRepo.first(table, {
        uuid: findUserWithAttribute.user_uuid,
      });

      let token = await tokensRepo.createTokenForUser(user);
      return token;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**  Registration - End */

/** Login via OTP - Start */

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

    await eventBus("user_requested_login_otp", {
      verificationObject: verificationObject,
    });

    // Todo: Process via Event Bus
    // await loginWithOtpEvent({
    //   user_uuid: verificationObject.user_uuid,
    //   token: verificationObject.token,
    //   type: verificationObject.attribute_type,
    //   value: verificationObject.attribute_value,
    //   contact_infos: [
    //     {
    //       type: payload.type,
    //       value: verificationObject.attribute_value,
    //     },
    //   ],
    // });
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

    // Todo: Process via Event Bus

    await eventBus("user_requested_login_otp", {
      verificationObject: verificationObject,
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

/** Login via OTP - End */

/** Login via Password - Start */

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

/** Login via Password - End */

/** Update Any Attribute - Start */

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

      await eventBus("verification_requested_during_update", {
        verificationObject: verificationObject,
        payload: payload,
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

const updateAttribute = async (payload) => {
  // Find if there is already a registration in process

  let verification = await verificationsRepo.findVerificationForUpdate({
    attribute_type: payload.type,
    attribute_value: payload.value,
  });

  // console.log("updateAttribute payload", payload);

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

    // await neptune.updateUserContactInfo(verification.uuid, {
    //   type: payload.type,
    //   value: payload.value,
    // });
  }

  await eventBus("verification_requested_during_update", {
    verificationObject: verificationObject,
    payload: payload,
  });

  return verification;
};

const verifyAttributeForUpdate = async (payload) => {
  try {
    let verification = await verificationsRepo.findVerificationForUpdate({
      attribute_type: payload.type,
      attribute_value: payload.value,
    });

    // console.log("payload", payload.token === verification.token);

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
          let createdAttribute = await attributesRepo.createAttributeForUUID(
            verification.user_uuid,
            {
              type: payload.type,
              value: payload.value,
              ...(payload.purpose && {
                purpose: payload.purpose,
              }),
            },
            true
          );

          await eventBus("user_added_new_attribute", {
            attributeObject: createdAttribute,
          });

          // await neptune.addUserContactInfoToNeptune(verification.user_uuid, {
          //   type: payload.type,
          //   value: payload.value,
          // });
        } else {
          let updatedAttribute = await attributesRepo.update(
            {
              uuid: existingAttribute.uuid,
            },
            {
              type: payload.type,
              value: payload.value,
              ...(payload.purpose && {
                purpose: payload.purpose,
              }),
            }
          );

          await eventBus("user_updated_existing_attribute", {
            existingAttribute: existingAttribute,
            attributeObject: updatedAttribute,
          });
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

/** Update Any Attribute - End */

/** Reset Password - Start */

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

      await eventBus("user_requested_reset_password", {
        verificationObject: verificationObject,
        payload: payload,
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

      await eventBus("user_requested_reset_password", {
        verificationObject: verificationObject,
        payload: payload,
      });
    }
  } catch (error) {
    throw error;
  }
};

const verifyAttributeForResetPasswordWithOTP = async (payload) => {
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

const verifyAttributeForResetPasswordWithLink = async (payload) => {
  try {
    console.log("verifyAttributeForResetPasswordWithLink", payload);

    let verification = await verificationsRepo.findVerificationForResetPassword(
      {
        user_uuid: payload.user_uuid,
        token: payload.token,
      }
    );

    console.log("verifyAttributeForResetPasswordWithLink", verification);

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (payload.token === verification.token) {
        await updateUserPassword(verification.user_uuid, payload.password);

        await verificationsRepo.removeVerification({
          uuid: verification.uuid,
        });

        return {
          success: true,
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

/** Reset Password - End */

const verifyOldPasswordAndResetPassword = async (user_uuid, payload) => {
  try {
    let user = await baseRepo.first(table, {
      uuid: user_uuid,
    });

    let result = bcrypt.compareSync(payload.old_password, user.password);

    if (result) {
      await updateUserPassword(user_uuid, payload.password);
      return result;
    } else {
      throw {};
    }
  } catch (error) {
    throw {
      statusCode: 422,
      message: "Invalid Old Password",
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

const createUserWithPassword = async (password, profile = {}) => {
  return await baseRepo.create(table, {
    password: bcrypt.hashSync(password, 5),
    profile: profile,
  });
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
  try {
    let user = await baseRepo.update(
      table,
      { uuid: uuid },
      { profile: payload }
    );

    await eventBus("user_updated_profile", {
      user: user,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

const registerFirebaseToken = async (userUuid, payload) => {
  try {
    return await neptune.addUserContactInfoToNeptune(userUuid, {
      type: "firebase_token",
      value: payload.value,
    });
  } catch (error) {
    throw error;
  }
};

const deRegisterFirebaseToken = async (userUuid, payload) => {
  try {
    return await neptune.deleteUserContactInfo(userUuid, {
      type: "firebase_token",
      value: payload.value,
    });
  } catch (error) {
    throw error;
  }
};

const registerUserFromWhatsApp = async (payload) => {
  try {
    const findUserWithAttribute = await attributesRepo.first({
      type: "mobile_number",
      value: payload.mobile,
    });

    if (findUserWithAttribute === undefined) {
      const user = await baseRepo.create(table, {
        profile: {
          name: payload.name,
        },
      });

      await attributesRepo.createAttributeForUUID(
        user.uuid,
        {
          type: "mobile_number",
          value: payload.mobile,
        },
        true
      );

      let userObject = await baseRepo.first(table, {
        uuid: user.uuid,
      });

      await eventBus("user_registered", {
        verificationObject: {
          user_uuid: user.uuid,
          attribute_type: "mobile_number",
          attribute_value: payload.mobile,
        },
        userObject: userObject,
        payload: payload,
      });

      let token = await tokensRepo.createTokenForUser(user);
      return token;
    } else {
      let user = await baseRepo.first(table, {
        uuid: findUserWithAttribute.user_uuid,
      });

      let token = await tokensRepo.createTokenForUser(user);
      return token;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const removeUser = async (payload) => {
  return await baseRepo.remove(table, payload, "hard");
};

module.exports = {
  getAllowedTypes,
  getAllowedVerificationMethods,
  createUserWithPassword,
  registerWithPassword,
  authenticateWithPassword,
  requestAttributeVerificationForRegistration,
  verifyAttributeForRegistrationUsingOTP,
  requestAttributeVerificationForResetPassword,
  verifyAttributeForResetPasswordWithOTP,
  verifyAttributeForRegistrationUsingLink,
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
  registerFirebaseToken,
  deRegisterFirebaseToken,
  verifyAttributeForResetPasswordWithLink,
  verifyOldPasswordAndResetPassword,
  registerUserFromWhatsApp,
  removeUser,
};
