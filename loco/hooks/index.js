const beforeValidateCreateAdminUsers = require("./beforeValidateCreateAdminUsers");
const beforePrepareCreateAdminUsers = require("./beforePrepareCreateAdminUsers");
const afterValidateCreateAdminUsers = require("./afterValidateCreateAdminUsers");
const beforeRespondCreateAdminUsers = require("./beforeRespondCreateAdminUsers");
const afterPreparePatchAdminUsers = require("./afterPreparePatchAdminUsers");

module.exports = {
  beforeValidateCreateAdminUsers,
  beforePrepareCreateAdminUsers,
  afterValidateCreateAdminUsers,
  beforeRespondCreateAdminUsers,
  afterPreparePatchAdminUsers,
};
