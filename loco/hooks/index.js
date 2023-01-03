const beforeValidateCreateAdminUsers = require("./beforeValidateCreateAdminUsers");
const beforePrepareCreateAdminUsers = require("./beforePrepareCreateAdminUsers");
const afterValidateCreateAdminUsers = require("./afterValidateCreateAdminUsers");
const beforeRespondCreateAdminUsers = require("./beforeRespondCreateAdminUsers");
const afterPreparePatchAdminUsers = require("./afterPreparePatchAdminUsers");
const afterValidateCreateAdminAdmins = require("./afterValidateCreateAdminAdmins");
const afterPreparePatchAdminAdmins = require("./afterPreparePatchAdminAdmins");
const afterPrepareUpdateAdminAdmins = require("./afterPrepareUpdateAdminAdmins");
const beforeRespondCreateAdminTeamMembers = require("./beforeRespondCreateAdminTeamMembers");

module.exports = {
  beforeValidateCreateAdminUsers,
  beforePrepareCreateAdminUsers,
  afterValidateCreateAdminUsers,
  beforeRespondCreateAdminUsers,
  afterPreparePatchAdminUsers,
  afterValidateCreateAdminAdmins,
  afterPreparePatchAdminAdmins,
  afterPrepareUpdateAdminAdmins,
  beforeRespondCreateAdminTeamMembers,
};
