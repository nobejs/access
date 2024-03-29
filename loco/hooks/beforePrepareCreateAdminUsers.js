const bcrypt = require("bcrypt");
const { executeActionInternally } = require("@locospec/engine");

module.exports = async (context) => {
  const { locoAction } = context;

  let result = await executeActionInternally(
    {
      resource: "admin-attributes",
      action: "create",
    },
    { ...locoAction.payload, stop_after_phase: "validate" }
  );

  context["originalPayload"] = JSON.parse(JSON.stringify(locoAction.payload));

  return context;
};
