const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const attributesRepo = requireRepo("attributes");
const baseRepo = requireUtil("baseRepo");

const gennerateQrCodeUrl = async (userUuid) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const qrCodeUrl = speakeasy.otpauthURL({
    secret: secret.ascii,
    label: "Access",
  });

  const qrData = {
    mfaPayload: {
      type: "mfa-secret",
      value: secret.ascii,
      purpose: null,
    },
    qrCodeUrl: qrCodeUrl,
  };

  await attributesRepo.createAttributeForUUID(
    userUuid,
    qrData.mfaPayload,
    true
  );

  return qrData;
};

const verifyMfaCode = async (payload) => {
  try {
    const userAttribute = await attributesRepo.findWithConstraints({
      user_uuid: payload.userUuid,
      type: "mfa-secret",
    });

    const secret = userAttribute[0].value;
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: "ascii",
      token: payload.authCode,
      window: 2, // Allow a time window of 2 intervals before/after the current time
    });

    if (isValid) {
      await updateUserMfaStatus(payload.userUuid, true);
      return {
        message: "Authentication successful!",
      };
    } else {
      return {
        message: "Authentication failed!",
      };
    }
  } catch (error) {
    throw error;
  }
};

const updateUserMfaStatus = async (uuid, mfa_enabled = falses) => {
  return await baseRepo.update(
    "users",
    { uuid: uuid },
    {
      profile: {
        mfa_enabled: mfa_enabled,
      },
    }
  );
};

module.exports = {
  gennerateQrCodeUrl,
  verifyMfaCode,
  updateUserMfaStatus,
};
