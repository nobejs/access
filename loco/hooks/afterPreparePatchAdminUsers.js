const bcrypt = require("bcrypt");

module.exports = async (context) => {
  const { locoAction } = context;

  const payload = JSON.parse(JSON.stringify(locoAction.payload));
  if (payload["password"] !== undefined) {
    payload["password"] = bcrypt.hashSync(payload["password"], 5);
    locoAction["payload"] = payload;
    context["locoAction"] = locoAction;
  }
  return context;
};
