const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = require("../createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test Handler Roles/TeamAdminCanGetRoles", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_get_roles", async () => {
    let result = {};
    try {
      let role = await rolesRepo.createRoleForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Role Title",
        permissions: {
          create_events: true,
        },
      });

      result = await testStrategy("Roles/TeamAdminCanGetRoles", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          issuer: "user",
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "roles*uuid": expect.any(String),
          "roles*permissions": expect.any(Object),
          "roles*created_at": expect.anything(),
          "roles*updated_at": expect.anything(),
          "roles*title": "Role Title",
        }),
      ])
    );
  });
});
