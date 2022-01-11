const contextClassRef = requireUtil("contextHelper");
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const usersRepo = requireRepo("users");
const teamMembersRepo = requireRepo("teamMembers");

describe("Test API TeamMembers/UserCanAcceptTeamMembership", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("user_can_accept_membership", async () => {
    let respondResult;
    let userToInvite;
    try {
      const app = httpServer();

      const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "shubham@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      userToInvite = user;
      userToInviteToken = token;

      let addTeamMemberPayload = {
        team_uuid: contextClassRef.testTeam.uuid,
        attribute_type: "email",
        attribute_value: "shubham@betalectic.com",
        status: "invited",
        user_uuid: userToInvite.uuid,
      };

      const invitedTeamMember = await teamMembersRepo.createTeamMember(
        addTeamMemberPayload
      );

      let headers = {
        Authorization: `Bearer ${userToInviteToken}`,
      };

      // let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "POST",
        url: `/teams/${contextClassRef.testTeam.uuid}/members/${invitedTeamMember.uuid}/accept`,
        payload: {},
        headers,
      });
      respondResult = respondResult;
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: expect.any(String),
      team_uuid: contextClassRef.testTeam.uuid,
      user_uuid: userToInvite.uuid,
      status: "accepted",
      attribute_type: "email",
      attribute_value: "shubham@betalectic.com",
    });
  });
});
