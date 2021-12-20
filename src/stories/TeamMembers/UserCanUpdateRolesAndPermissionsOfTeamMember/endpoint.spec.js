const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");

describe("Test API TeamMembers/UserCanUpdateRolesAndPermissionsOfTeamMember", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid, "accepted");
  });

  it("admin_can_update_roles_and_permissions_of_a_user_who_is_a_valid_team_member", async () => {
    let respondResult;
    try {
      const app = httpServer();
      let headers = contextClassRef.headers;
      const payload = {
        permissions: { developer: true },
      };

      respondResult = await app.inject({
        method: "PUT",
        url: `/teams/${contextClassRef.testTeam.uuid}/members/${contextClassRef.teamMember.uuid}/assign-role-permission`,
        payload,
        headers,
      });

      respondResult = respondResult;
    } catch (error) {
      console.log("error13", error);
      respondResult = error;
    }

    // expect(1).toBe(1);
    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
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
});
