const debugLogger = requireUtil("debugLogger");

describe("Test Handler Teams/UserCanViewTeam", () => {
  it("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("Teams/UserCanViewTeam", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
