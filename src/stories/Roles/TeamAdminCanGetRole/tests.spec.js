const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = require("../createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test Handler Roles/TeamAdminCanGetRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });
  it("admin_can_get_role", async () => {
    let result = {};
    try {
      let role = await rolesRepo.createRoleForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Role Title",
        permissions: {
          create_events: true,
        },
      });

      result = await testStrategy("Roles/TeamAdminCanGetRole", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          issuer: "user",
          role_uuid: role.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      created_at: expect.anything(),
      updated_at: expect.anything(),
      permissions: expect.any(Object),
      title: "Role Title",
    });
  });
});
