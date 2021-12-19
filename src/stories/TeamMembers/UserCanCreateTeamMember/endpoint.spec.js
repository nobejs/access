const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");

describe("Test API TeamMembers/UserCanCreateTeamMember", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("user_can_add_a_team_member_to_a_team_he_has_access_to", async () => {
    let respondResult;
    try {
      const app = httpServer();
      const headers = contextClassRef.headers;

      const payload = {
        team_uuid: contextClassRef.testTeam.uuid,
        attribute_type: "email",
        attribute_value: "shubham@betalectic.com",
        invoking_user_uuid: contextClassRef.user.uuid,
        permissions: { member: true },
      };

      respondResult = await app.inject({
        method: "POST",
        url: `/teams/${contextClassRef.testTeam.uuid}/members`,
        payload,
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      team_uuid: contextClassRef.testTeam.uuid,
      status: "invited",
    });
  });
});
