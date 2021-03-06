const debugLogger = requireUtil("debugLogger");
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");

describe("Test Handler TeamMembers/UserCanCreateTeamMember", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("user_can_add_a_team_member_to_a_team_he_has_access_to", async () => {
    let respondResult = {};
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanCreateTeamMember", {
        prepareResult: {
          team_uuid: contextClassRef.testTeam.uuid,
          attribute_type: "email",
          attribute_value: "shubham@betalectic.com",
          invoking_user_uuid: contextClassRef.user.uuid,
          permissions: { member: true },
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }
    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      status: "invited",
      attribute_value: "shubham@betalectic.com",
      attribute_type: "email",
      permissions: { member: true },
    });
  });

  it("user_cannot_add_a_team_member_to_a_team_he_has_no_access_to", async () => {
    let result = {};
    let respondResult = {};
    try {
      const { user } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "rajesh@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      let userWhoDoesNotBelongToTeam = user;

      result = await testStrategy("TeamMembers/UserCanCreateTeamMember", {
        prepareResult: {
          team_uuid: contextClassRef.testTeam.uuid,
          type: "email",
          value: "shubham@betalectic.com",
          invoking_user_uuid: userWhoDoesNotBelongToTeam.uuid,
          permissions: { admin: false },
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }
    expect(respondResult.statusCode).toBe(403);
  });
});
