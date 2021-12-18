const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = require("../createUserAndTeam");

describe("Test API Teams/UserCanViewTeams", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it.skip("dummy_story_which_will_pass", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {};
    } catch (error) {
      respondResult = error;
    }

    // expect(respondResult.statusCode).toBe(200);
    // expect(respondResult.json()).toMatchObject({});
    expect(1).toBe(1);
  });
});
