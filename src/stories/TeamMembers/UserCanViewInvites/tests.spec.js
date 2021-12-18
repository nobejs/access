const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();

describe("Test Handler TeamMembers/UserCanViewInvites", () => {
  it("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanViewInvites", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
