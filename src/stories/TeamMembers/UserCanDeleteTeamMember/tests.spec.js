const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler TeamMembers/UserCanDeleteTeamMember", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("admin_should_be_able_to_delete_existing_team_member", async () => {
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanDeleteTeamMember", {
        prepareResult: {
          team_member_uuid: contextClassRef.teamMember.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          invoking_user_uuid: contextClassRef.user.uuid,
        },
      });
    } catch (error) {
      result = error;
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toMatchObject({ message: "Deleted successfully" });
  });

  it("admin_cannot_delete_non_existing_team_member", async () => {
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanDeleteTeamMember", {
        prepareResult: {
          team_member_uuid: "515d0ed8-a00d-413a-ac5e-ab729a069ce6",
          team_uuid: contextClassRef.testTeam.uuid,
          invoking_user_uuid: contextClassRef.user.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
      result = error;
    }
    const { respondResult } = result;

    expect(result).toMatchObject({
      message: "Team Member not found",
      statusCode: 404,
    });
  });

  it("user_who_is_not_admin_cannot_delete_existing_team_member", async () => {
    let result = {};
    try {
      result = await testStrategy("TeamMembers/UserCanDeleteTeamMember", {
        prepareResult: {
          team_member_uuid: contextClassRef.teamMember.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          invoking_user_uuid: contextClassRef.teamMember.uuid,
        },
      });
    } catch (error) {
      result = error;
      debugLogger(error);
    }
    expect(result).toMatchObject({ statusCode: 403, message: "Forbidden" });
  });
});
