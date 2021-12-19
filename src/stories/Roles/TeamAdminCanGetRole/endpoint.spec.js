const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const httpServer = requireHttpServer();
const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test API Roles/TeamAdminCanGetRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_get_role", async () => {
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
        url: `/teams/${contextClassRef.testTeam.uuid}/roles/${role.uuid}`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: expect.any(String),
      created_at: expect.anything(),
      updated_at: expect.anything(),
      permissions: expect.any(Object),
      title: "Role Title",
    });
  });

  it("get_404_for_non_existing_role", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/${contextClassRef.testTeam.uuid}/roles/43909044`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(404);
  });

  it("get_404_for_non_existing_team", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/443543543/roles/43909044`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(404);
  });
});
