const bcrypt = require("bcrypt");

const generatePassword = (password) => {
  console.log("Password: ", password);
  return bcrypt.hashSync(password, 5);
};

if (process.argv[2]) {
  let result = generatePassword(process.argv[2]);
  console.log(result);
}

module.exports = generatePassword;
