const crypto = require("crypto");

module.exports = function generateRandomNumber(numDigits) {
  numDigits = parseInt(numDigits, 10);
  // Calculate the maximum and minimum values for the specified number of digits
  let max = 10 ** numDigits - 1;
  let min = 10 ** (numDigits - 1);
  // Use a cryptographically secure generator, OTPs are built on this
  return crypto.randomInt(min, max + 1);
};
