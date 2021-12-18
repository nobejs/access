const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const httpServer = requireHttpServer();
const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = require("../createUserAndTeam");
const rolesRepo = requireRepo("roles");

describe("Test API Roles/TeamAdminCanUpdateRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_update_role", async () => {
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

      const payload = {
        title: "Role Title Updated",
        permissions: {
          manager_events: true,
        },
      };

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "PUT",
        url: `/teams/${contextClassRef.testTeam.uuid}/roles/${role.uuid}`, // This should be in endpoints.js,\
        payload,
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
      title: "Role Title Updated",
    });
  });

  it("get_404_for_non_existing_role", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let headers = contextClassRef.headers;

      const payload = {
        title: "Role Title Updated",
        permissions: {
          manager_events: true,
        },
      };

      respondResult = await app.inject({
        method: "PUT",
        url: `/teams/${contextClassRef.testTeam.uuid}/roles/43909044`, // This should be in endpoints.js
        payload,
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(404);
  });

  it("get_422_for_invalid_data", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "PUT",
        url: `/teams/443543543/roles/43909044`, // This should be in endpoints.js
        payload: {},
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(422);
  });
});
