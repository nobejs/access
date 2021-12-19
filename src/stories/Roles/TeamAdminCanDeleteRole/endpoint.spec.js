const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const httpServer = requireHttpServer();
const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test API Roles/TeamAdminCanDeleteRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_delete_role", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let role = await rolesRepo.createRoleForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Role Title",
        permissions: {
          create_events: true,
        },
      });

      const payload = {};

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "DELETE",
        url: `/teams/${contextClassRef.testTeam.uuid}/roles/${role.uuid}`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      message: "Role successfully deleted",
    });
  });
});
