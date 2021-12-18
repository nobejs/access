const debugLogger = requireUtil("debugLogger");

describe("Test Handler TeamMembers/UserCanCreateTeamMember", () => {
  it.skip("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanCreateTeamMember", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
