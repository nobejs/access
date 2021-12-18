const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = require("../createUserAndTeam");

describe("Test API Teams/UserCanViewTeam", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it.skip("dummy_story_which_will_pass", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {};

      // respondResult = await app.inject({
      //   method: "POST",
      //   url: "/api_endpoint", // This should be in endpoints.js
      //   payload,
      //   headers,
      // });
    } catch (error) {
      respondResult = error;
    }

    // expect(respondResult.statusCode).toBe(200);
    // expect(respondResult.json()).toMatchObject({});
    expect(1).toBe(1);
  });
});
