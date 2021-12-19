const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const teamMembersRepo = requireRepo("teamMembers");
const usersRepo = requireRepo("users");
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler TeamMembers/UserCanAcceptTeamMembership", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("user_can_accept_membership", async () => {
    let result = {};
    let memberUser = {};
    try {
      const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "shubham@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      memberUser = user;

      let payload = {
        team_uuid: contextClassRef.testTeam.uuid,
        attribute_type: "email",
        attribute_value: "shubham@betalectic.com",
        status: "invited",
        user_uuid: contextClassRef.user.uuid,
      };

      const teamMember = await teamMembersRepo.createTeamMember(payload);

      console.log("teamMember", teamMember);

      result = await testStrategy("TeamMembers/UserCanAcceptTeamMembership", {
        prepareResult: {
          team_member_uuid: teamMember.uuid,
          invoking_user_uuid: memberUser.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      team_uuid: contextClassRef.testTeam.uuid,
      user_uuid: memberUser.uuid,
      status: "accepted",
      attribute_type: "email",
      attribute_value: "shubham@betalectic.com",
    });
  });
});
