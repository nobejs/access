const bcrypt = require("bcrypt");
const { executeActionInternally } = require("@locospec/engine");

module.exports = async (context) => {
  const { locoAction } = context;

  locoAction.payload["password"] = bcrypt.hashSync(
    locoAction.payload["password"],
    5
  );

  return context;
};
