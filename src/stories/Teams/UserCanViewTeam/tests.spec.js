const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const contextClassRef = requireUtil("contextHelper");
const usersRepo = requireRepo("users");

describe("Test Handler Teams/UserCanViewTeam", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });
  it("user_can_view_his_team", async () => {
    let result = {};
    try {
      result = await testStrategy("Teams/UserCanViewTeam", {
        prepareResult: {
          team_uuid: contextClassRef.testTeam.uuid,
          invoking_user_uuid: contextClassRef.user.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
      result = error;
    }
    const { respondResult } = result;
    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      creator_user_uuid: contextClassRef.user.uuid,
    });
  });

  it("user_cannot_view_the_team_he_is_not_a_member_of", async () => {
    let result = {};
    let nonTeamMember;
    try {
      const { user } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "rajesh@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      nonTeamMember = user;

      result = await testStrategy("Teams/UserCanViewTeam", {
        prepareResult: {
          team_uuid: contextClassRef.testTeam.uuid,
          stripe_return_url: null,
          invoking_user_uuid: nonTeamMember.uuid,
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }
    expect(respondResult).toMatchObject({
      statusCode: 404,
      message: "Invalid Member",
    });
  });
});
