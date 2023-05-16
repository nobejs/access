const crypto = require("crypto");

module.exports = async (encryptedData, alg = "aes-256-cbc") => {
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

    const buff = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv(alg, key, encryptionIV);

    let decryptedData =
      decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8");
    return decryptedData;
  } catch (error) {
    throw error;
  }
};
