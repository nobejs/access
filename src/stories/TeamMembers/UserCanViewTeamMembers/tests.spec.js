const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");
const contextClassRef = requireUtil("contextHelper");

describe("Handler AnUserShouldBeAbleToGetTheirTeamMembers", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("outsider_shouldnt_be_able_access_a_team_members", async () => {
    let result;
    try {
      result = await testStrategy("TeamMembers/UserCanViewTeamMembers", {
        prepareResult: {
          team_uuid: contextClassRef.testTeam.uuid,
          invoking_user_uuid: "54c2779a-7200-4d98-be14-d4aec12b2fa9",
        },
      });
    } catch (error) {
      result = error;
    }

    expect(result.statusCode).toBe(403);
  });

  it("member_can_get_team_members", async () => {
    let result;
    try {
      result = await testStrategy("TeamMembers/UserCanViewTeamMembers", {
        prepareResult: {
          team_uuid: contextClassRef.testTeam.uuid,
          invoking_user_uuid: contextClassRef.teamMember.user_uuid,
        },
      });
    } catch (error) {
      result = error;
    }

    const { respondResult } = result;
    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.user.uuid,
        }),
      ])
    );
  });
});
