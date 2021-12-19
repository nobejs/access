const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const httpServer = requireHttpServer();
const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test API Roles/TeamAdminCanGetRoles", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_get_roles", async () => {
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

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/${contextClassRef.testTeam.uuid}/roles`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
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
