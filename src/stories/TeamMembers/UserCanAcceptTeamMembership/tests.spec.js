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
    let respondResult;
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
        user_uuid: memberUser.uuid,
      };

      const invitedTeamMember = await teamMembersRepo.createTeamMember(payload);

      result = await testStrategy("TeamMembers/UserCanAcceptTeamMembership", {
        prepareResult: {
          team_member_uuid: invitedTeamMember.uuid,
          invoking_user_uuid: memberUser.uuid,
          // invoking_user_uuid: contextClassRef.user.uuid,
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      respondResult = error;
      debugLogger(error);
    }

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
