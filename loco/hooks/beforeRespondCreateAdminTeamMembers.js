const bcrypt = require("bcrypt");
const { executeActionInternally } = require("@locospec/engine");
const eventBus = require("../../src/eventBus");

module.exports = async (context) => {
  const { locoAction } = context;

  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  for (let index = 0; index < currentData.length; index++) {
    const element = currentData[index];

    let memberResult = await executeActionInternally(
      {
        resource: "admin-team-members",
        action: "read",
      },
      {
        apiConfig: {
          includeRelations: ["user", "team"],
        },
        filterBy: [
          {
            attribute: "uuid",
            op: "eq",
            value: element.uuid,
          },
        ],
      }
    );

    let attributesResult = await executeActionInternally(
      {
        resource: "admin-attributes",
        action: "read",
      },
      {
        filterBy: [
          {
            attribute: "user_uuid",
            op: "eq",
            value: element.user_uuid,
          },
        ],
      }
    );

    await eventBus("user_added_to_team_by_admin", {
      member: memberResult["respondResult"]["data"][0],
      attributes: attributesResult["respondResult"]["data"],
    });
  }

  return context;
};
