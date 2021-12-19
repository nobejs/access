const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");

describe("Test API TeamMembers/UserCanViewInvites", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("user_should_be_able_to_see_team_invites", async () => {
    let respondResult;
    try {
      const app = httpServer();
      let headers = {
        Authorization: `Bearer ${contextClassRef.memberToken}`,
      };

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/invites?tenant=${contextClassRef.testTeam.tenant}`,
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.teamMember.user_uuid,
          "team_members*status": "invited",
        }),
      ])
    );
  });
});
