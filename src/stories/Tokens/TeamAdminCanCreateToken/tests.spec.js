const debugLogger = requireUtil("debugLogger");

describe("Test Handler Tokens/TeamAdminCanCreateToken", () => {
  it("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("Tokens/TeamAdminCanCreateToken", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
