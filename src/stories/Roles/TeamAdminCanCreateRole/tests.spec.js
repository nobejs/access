const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = require("../createUserAndTeam");

describe("Test Handler Roles/TeamAdminCanCreateRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_create_role", async () => {
    let result = {};
    try {
      result = await testStrategy("Roles/TeamAdminCanCreateRole", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          issuer: "user",
          title: "Role Title",
          permissions: {
            create_events: true,
          },
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      title: "Role Title",
    });
  });
});
