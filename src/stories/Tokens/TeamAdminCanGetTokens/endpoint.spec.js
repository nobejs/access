const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const teamsRepo = requireRepo("teams");
const tokensRepo = requireRepo("tokens");
const decodeJWT = requireFunction("JWT/decodeJWT");
const createUserAndTeam = requireFunction("createUserAndTeam");
const truncateAllTables = requireFunction("truncateAllTables");

describe("Test API Tokens/TeamAdminCanGetTokens", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("admin_can_get_tokens", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const token = await tokensRepo.createTokenForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Personal",
        permissions: {
          create_events: true,
        },
      });

      let headers = contextClassRef.headers;

      const payload = {};

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/${contextClassRef.testTeam.uuid}/tokens`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "tokens*uuid": expect.any(String),
          "tokens*title": "Personal",
        }),
      ])
    );
  });
});
