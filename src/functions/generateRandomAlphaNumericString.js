module.exports = function generateRandomAlphaNumericString(length = 6) {
  var alphaNumerics =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomAlphaNumericString = "";
  for (let i = 0; i < length; i++) {
    randomAlphaNumericString += alphaNumerics[Math.floor(Math.random() * alphaNumerics.length)];
  }
  return randomAlphaNumericString;
};
