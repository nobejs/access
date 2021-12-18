const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = require("../createUserAndTeam");

describe("Test API Roles/TeamAdminCanCreateRole", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_create_role", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        title: "Role Title",
        permissions: {
          create_events: true,
        },
      };

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "POST",
        url: `/teams/${contextClassRef.testTeam.uuid}/roles`, // This should be in endpoints.js
        payload,
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: expect.any(String),
      title: "Role Title",
    });
  });
});
