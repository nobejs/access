const jose = require("jose");

module.exports = async (jti, sub, issuer, payload = {}, expiry = "1y") => {
  try {
    // console.log("process.env.PRIVATE_KEY", process.env.PRIVATE_KEY);

    const privateKeyEnv = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

    // console.log("privateKeyEnv", privateKeyEnv);

    const ecPrivateKey = await jose.importPKCS8(privateKeyEnv, "ed25519");

    // console.log("privateKeyEnv", ecPrivateKey);

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "EdDSA" })
      .setExpirationTime(expiry)
      .setSubject(sub)
      .setIssuer(issuer)
      .setJti(jti)
      .sign(ecPrivateKey);

    return jwt;
  } catch (error) {
    // console.log("Failed generating JWT", error);
    throw error;
  }
};
