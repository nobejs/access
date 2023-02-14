module.exports = function generateRandomNumber(numDigits) {
  // Calculate the maximum and minimum values for the specified number of digits
  let max = 10 ** numDigits - 1;
  let min = 10 ** (numDigits - 1);
  // Generate a random number between the minimum and maximum values
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
