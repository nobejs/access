const bcrypt = require("bcrypt");
const { executeActionInternally } = require("@locospec/engine");
const eventBus = require("../../src/eventBus");
const verificationRepo = require("../../src/repositories/verifications");

module.exports = async (context) => {
  const { locoAction } = context;
  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

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
    if (context["originalPayload"]["adminRequestUserToSetPassword"] == true) {
      const payload = context["originalPayload"];
      let data = {
        user_uuid: element.uuid,
        attribute_type: payload.type,
        attribute_value: payload.value,
      };
      const verification =
        await verificationRepo.createVerificationForResetPassword(data);

      await eventBus("admin_request_user_to_set_password", {
        payload: payload,
        verification: verification,
      });
    } else {
      await eventBus("user_created_by_admin", {
        user: element,
        payload: context["originalPayload"],
      });
    }
  }

  return context;
};
