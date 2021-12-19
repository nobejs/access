const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = requireFunction("createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test Handler Roles/TeamAdminCanDeleteRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });
  it("admin_can_delete_role", async () => {
    let result = {};
    try {
      let role = await rolesRepo.createRoleForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Role Title",
        permissions: {
          create_events: true,
        },
      });

      result = await testStrategy("Roles/TeamAdminCanDeleteRole", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          role_uuid: role.uuid,
          issuer: "user",
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      message: "Role successfully deleted",
    });
  });
});
