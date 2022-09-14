const bcrypt = require("bcrypt");
const baseRepo = requireUtil("baseRepo");
const verificationsRepo = requireRepo("verifications");
const tokensRepo = requireRepo("tokens");
const { resetPasswordVerificationEvent } = require("../events");
const table = "admins";
const isDateInPast = requireFunction("isDateInPast");

const findUserByValue = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
};

const authenticateWithPassword = async (payload) => {
  let admin = await baseRepo.first(table, {
    email: payload.email,
  });

  if (admin === undefined) {
		throw {
			statusCode: 422,
			message: "NotRegistered",
		};
	}

  let result = bcrypt.compareSync(payload.password, admin.password);


  if (result) {
    let token = await tokensRepo.createTokenForAdmin(admin);
    return token;
  } else {
    throw {
      statusCode: 422,
      message: "Invalid Username or Password",
    };
  }
};

const requestAttributeVerificationForResetPassword = async (payload) => {
  try {
    // Find if there is already an existing verification for this
    let verification = await verificationsRepo.findVerificationForResetPassword(
      {
        attribute_type: "email",
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
      let admin = await baseRepo.first(table, {
        email: payload.value,
      });

      let verificationObject =
        await verificationsRepo.createVerificationForResetPassword({
          user_uuid: admin.uuid,
          attribute_type: "email",
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
        attribute_type: "email",
        attribute_value: payload.value,
      }
    );

    if (verification !== undefined && !isDateInPast(verification.expires_at)) {
      if (payload.token === verification.token) {
        await updateAdminPassword(verification.user_uuid, payload.password);

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

const updateAdminPassword = async (uuid, password) => {
  return await baseRepo.update(
    table,
    { uuid: uuid },
    {
      password: bcrypt.hashSync(password, 5),
    }
  );
};

module.exports = {
  authenticateWithPassword,
  requestAttributeVerificationForResetPassword,
  verifyAttributeForResetPassword,
  findUserByValue,
  first,
  updateAdminPassword,
};
