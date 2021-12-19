const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");
const httpServer = requireHttpServer();
const usersRepo = requireRepo("users");

describe("Handler UserCanViewTeamMembers", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("member_should_be_able_to_access_team_members", async () => {
    let response;
    try {
      const app = httpServer();
      let headers = {
        Authorization: `Bearer ${contextClassRef.memberToken}`,
      };

      response = await app.inject({
        method: "GET",
        url: `teams/${contextClassRef.testTeam.uuid}/members`,
        headers,
      });
    } catch (error) {
      response = error;
      debugLogger(response.json());
    }

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.user.uuid,
        }),
      ])
    );
  });

  it("outsider_shouldnt_be_able_access_a_team_members", async () => {
    let response;
    try {
      const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "jonty@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });
      let teamTwoUserToken = token;

      const app = httpServer();
      let headers = {
        Authorization: `Bearer ${teamTwoUserToken}`,
      };

      response = await app.inject({
        method: "GET",
        url: `teams/${contextClassRef.testTeam.uuid}/members`,
        headers,
      });
    } catch (error) {
      response = error;
      debugLogger(response);
    }

    expect(response.statusCode).toBe(403);
  });
});
