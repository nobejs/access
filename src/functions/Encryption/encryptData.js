const crypto = require("crypto");

module.exports = async (data, alg = "aes-256-cbc") => {
  try {
    const key = crypto
      .createHash("sha512")
      .update(process.env.SECRET_ENC_KEY)
      .digest("hex")
      .substring(0, 32);
    const encryptionIV = crypto
      .createHash("sha512")
      .update(process.env.SECRET_ENC_IV)
      .digest("hex")
      .substring(0, 16);

    // Encrypt data

    const cipher = crypto.createCipheriv(alg, key, encryptionIV);
    return Buffer.from(
      cipher.update(data, "utf8", "hex") + cipher.final("hex")
    ).toString("base64"); // Encrypts data and converts to hex and base64
  } catch (error) {
    throw error;
  }
};
