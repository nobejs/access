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
  it("user_can_get_his_teams_for_requested_tenant", async () => {
    let result = {};

    try {
      /* creating second team for user */
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

  it("user_with_no_teams_for_requested_tenant_should_get_zero_teams", async () => {
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
    expect(respondResult).toHaveLength(0);
  });

  /* WHAT SHOULD HAPPEN IF THE USER DOES NOT BELONG TO THE REQUESTING TENANT OR IF IT DOESN'T EXISTS */
  // it.skip("user_should_get_teams_only_for_requested_tenant", async () => {
  //   let result = {};
  //   let userWithNoTeamsYet;

  //   try {
  //     result = await testStrategy("Teams/UserCanViewTeams", {
  //       prepareResult: {
  //         tenant: "handler-test-2",
  //         invoking_user_uuid: contextClassRef.user.uuid,
  //       },
  //     });
  //   } catch (error) {
  //     debugLogger(error);
  //   }
  //   const { respondResult } = result;
  //   console.log("respondResult12", respondResult);
  //   /* Here we have to check that the returning tenant is same as requesting or we have to check for the error */
  //   expect(respondResult).toHaveLength(0);
  // });

  /* it('user_should_access_the_teams_or_just_requested_tenant') */
});
