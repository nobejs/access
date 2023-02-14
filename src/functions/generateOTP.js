const generateRandomNumber = require("./generateRandomNumber");

module.exports = function generateOTP() {
  const otpLength = process.env.OTP_LENGTH || 6;
  const randomOTP = generateRandomNumber(otpLength);
  return randomOTP;
};
