const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler TeamMembers/UserCanViewInvites", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("user_should_be_able_to_see_team_invites", async () => {
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanViewInvites", {
        prepareResult: {
          tenant: contextClassRef.testTeam.tenant,
          invoking_user_uuid: contextClassRef.teamMember.user_uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.teamMember.user_uuid,
          "team_members*status": "invited",
        }),
      ])
    );
  });
});
