const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler TeamMembers/UserCanUpdateRolesAndPermissionsOfTeamMember", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid, "accepted");
  });

  it("admin_can_update_roles_and_permissions_of_a_user_who_is_a_valid_team_member", async () => {
    let result = {};
    let respondResult;
    let permission = { developer: true };
    try {
      let prepareResultPayload = {
        team_member_uuid: contextClassRef.teamMember.uuid,
        team_uuid: contextClassRef.testTeam.uuid,
        // "role_uuid": ,
        permissions: permission,
        invoking_user_uuid: contextClassRef.user.uuid,
      };

      result = await testStrategy(
        "TeamMembers/UserCanUpdateRolesAndPermissionsOfTeamMember",
        {
          prepareResult: prepareResultPayload,
        }
      );

      respondResult = result.respondResult;
    } catch (error) {
      respondResult = error;
      debugLogger(error);
    }
    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uuid: contextClassRef.teamMember.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          user_uuid: contextClassRef.teamMember.user_uuid,
          status: "accepted",
          permissions: expect.any(Object),
        }),
      ])
    );
  });

  // it.skip("admin_cannot_update_roles_and_permissions_of_a_user_who_is_not_a_valid_team_member", async () => {
  //   let result = {};
  //   let respondResult;
  //   try {
  //     result = await testStrategy(
  //       "TeamMembers/UserCanUpdateRolesAndPermissionsOfTeamMember",
  //       {
  //         prepareResult: {},
  //       }
  //     );
  //     respondResult = result;
  //   } catch (error) {
  //     respondResult = error;
  //     debugLogger(error);
  //   }
  //   expect(1).toBe(1);
  // });
});
