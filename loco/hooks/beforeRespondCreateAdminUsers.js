const bcrypt = require("bcrypt");
const { executeActionInternally } = require("@locospec/engine");

module.exports = async (context) => {
  const { locoAction } = context;

  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  console.log("currentData", currentData, context["originalPayload"]);

  for (let index = 0; index < currentData.length; index++) {
    const element = currentData[index];

    let result = await executeActionInternally(
      {
        resource: "admin-attributes",
        action: "create",
      },
      {
        type: context["originalPayload"]["type"],
        value: context["originalPayload"]["value"],
        user_uuid: element["uuid"],
        verified_at:
          context["originalPayload"]["verified_at"] || new Date().toISOString(),
        purpose: context["originalPayload"]["purpose"] || "na",
      }
    );
  }

  return context;
};
