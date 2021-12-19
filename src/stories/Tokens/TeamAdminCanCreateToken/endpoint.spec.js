const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");
const decodeJWT = requireFunction("JWT/decodeJWT");
const createUserAndTeam = requireFunction("createUserAndTeam");
const truncateAllTables = requireFunction("truncateAllTables");

describe("Test API Tokens/TeamAdminCanCreateToken", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("team_admin_can_create_token", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        title: "Personal",
        permissions: {
          create_events: true,
        },
      };

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "POST",
        url: `/teams/${contextClassRef.testTeam.uuid}/tokens`, // This should be in endpoints.js
        payload,
        headers,
      });
    } catch (error) {
      respondResult = error;
      console.log("error", error);
    }

    const decoded = await decodeJWT(respondResult.json().token);

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      token: expect.any(String),
    });

    expect(decoded).toMatchObject({
      sub: contextClassRef.testTeam.uuid,
    });
  });
});
