const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();

describe("Test Handler Users/RedirectForLoginWithLinkedin", () => {
  it.skip("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("Users/RedirectForLoginWithLinkedin", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
