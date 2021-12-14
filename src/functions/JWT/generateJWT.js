const jose = require("jose");

module.exports = async (jti, sub, payload = {}, expiry = "1y") => {
  try {
    const privateKeyEnv = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");
    const ecPrivateKey = await jose.importPKCS8(privateKeyEnv, "ed25519");

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "EdDSA" })
      .setExpirationTime(expiry)
      .setSubject(sub)
      .setJti(jti)
      .sign(ecPrivateKey);

    return jwt;
  } catch (error) {
    throw error;
  }
};
