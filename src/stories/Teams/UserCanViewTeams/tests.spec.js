const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const contextClassRef = requireUtil("contextHelper");
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");

describe("Test Handler Teams/UserCanViewTeams", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam(); // user has already created a team.
  });
  it("user_can_get_his_teams", async () => {
    let result = {};

    try {
      await teamsRepo.createTestTeamForUser(
        {
          tenant: "handler-test",
          name: "Shuhbam's Personal Team",
          slug: "shubham-personal-team",
          creator_user_uuid: contextClassRef.user.uuid,
        },
        contextClassRef.user.uuid
      );

      result = await testStrategy("Teams/UserCanViewTeams", {
        prepareResult: {
          tenant: "handler-test",
          invoking_user_uuid: contextClassRef.user.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(respondResult).toHaveLength(2);
    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.user.uuid,
          "teams*uuid": contextClassRef.testTeam.uuid,
        }),
      ])
    );
  });

  it("user_with_no_teams_should_get_zero_teams", async () => {
    let result = {};
    let userWithNoTeamsYet;

    try {
      const { user } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "rajesh@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      userWithNoTeamsYet = user;

      result = await testStrategy("Teams/UserCanViewTeams", {
        prepareResult: {
          tenant: "handler-test",
          invoking_user_uuid: userWithNoTeamsYet.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    console.log("respondResult12", respondResult);
    expect(respondResult).toHaveLength(0);
  });
});
