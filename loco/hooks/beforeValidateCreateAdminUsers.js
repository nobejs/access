const bcrypt = require("bcrypt");
const { executeActionInternally } = require("@locospec/engine");

module.exports = async (context) => {
  const { locoAction } = context;

  // let result = await executeActionInternally(
  //   {
  //     resource: "admin-attributes",
  //     action: "create",
  //   },
  //   payload
  // );

  // console.log("beforeValidateCreateAdminUsers", locoAction.payload);

  return context;
};
