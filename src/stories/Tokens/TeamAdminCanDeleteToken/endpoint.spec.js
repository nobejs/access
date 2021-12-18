const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const teamsRepo = requireRepo("teams");
const tokensRepo = requireRepo("tokens");
const decodeJWT = requireFunction("JWT/decodeJWT");
const createUserAndTeam = require("../createUserAndTeam");
const truncateAllTables = requireFunction("truncateAllTables");

describe("Test API Tokens/TeamAdminCanDeleteToken", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("team_admin_can_delete_token", async () => {
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

      const decoded = await decodeJWT(token);

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "DELETE",
        url: `/teams/${contextClassRef.testTeam.uuid}/tokens/${decoded.jti}`, // This should be in endpoints.js
        headers,
      });
    } catch (error) {
      console.log("error", error);
      respondResult = error;
    }

    // console.log(respondResult.json());

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      message: "Token deleted Successfully",
    });
  });
});
