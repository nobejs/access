const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = requireFunction("createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test Handler Roles/TeamAdminCanUpdateRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_update_role", async () => {
    let result = {};
    try {
      let role = await rolesRepo.createRoleForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Role Title",
        permissions: {
          create_events: true,
        },
      });

      result = await testStrategy("Roles/TeamAdminCanUpdateRole", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          issuer: "user",
          role_uuid: role.uuid,
          title: "Role Title Updated",
          permissions: {
            manage_events: true,
          },
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
      title: "Role Title Updated",
    });
  });
});
