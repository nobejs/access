const jose = require("jose");

module.exports = async (jwt) => {
  try {
    const publicKeyEnv = process.env.PUBLIC_KEY.replace(/\\n/g, "\n");
    const ecPublicKey = await jose.importSPKI(publicKeyEnv, "ed25519");
    const { payload } = await jose.jwtVerify(jwt, ecPublicKey);
    return payload;
  } catch (error) {
    throw error;
  }
};
