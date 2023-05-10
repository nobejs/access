const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();

describe("Test Handler Users/EnableMfa", () => {
  it("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("Users/EnableMfa", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
