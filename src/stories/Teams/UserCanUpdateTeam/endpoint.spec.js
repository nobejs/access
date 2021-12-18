const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const createUserWithVerifiedToken = testHelper("createUserWithVerifiedToken");
const httpServer = requireHttpServer();
const TeamsRepo = requireRepo("teams");

describe("API UserCanUpdateTeam", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("tokens").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();

    const { user, token } = await createUserWithVerifiedToken();
    contextClassRef.token = token;
    contextClassRef.user = user;

    const testTeam = await TeamsRepo.createTestTeamForUser(
      {
        tenant: "api-test",
        name: "Rajiv's Personal Team",
        slug: "rajiv-personal-team",
      },
      contextClassRef.user.uuid
    );

    contextClassRef.testTeam = testTeam;

    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.token}`,
    };
  });

  it("user_can_update_team", async () => {
    let response;
    let createdResponse;

    try {
      createdResponse = contextClassRef.testTeam;
      let team_uuid = createdResponse["uuid"];

      let updatePayload = {
        tenant: "api-test",
        name: "Rajiv's Personal Team 2",
        slug: "rajiv-personal-team",
      };

      const app = httpServer();

      response = await app.inject({
        method: "PUT",
        url: `/teams/${team_uuid}`,
        payload: updatePayload,
        headers: contextClassRef.headers,
      });
    } catch (error) {
      console.log("error", error);
      response = error;
    }

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      name: "Rajiv's Personal Team 2",
    });
  });

  it("user_can_update_team_slug", async () => {
    let response;
    let createdResponse;

    try {
      createdResponse = contextClassRef.testTeam;
      let team_uuid = createdResponse["uuid"];

      let updatePayload = {
        tenant: "api-test",
        name: "Rajiv's Slug Team 2",
        slug: "rajiv-slug-team-2",
      };

      const app = httpServer();

      response = await app.inject({
        method: "PUT",
        url: `/teams/${team_uuid}`,
        payload: updatePayload,
        headers: contextClassRef.headers,
      });
    } catch (error) {
      response = error;
    }

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      name: "Rajiv's Slug Team 2",
      slug: "rajiv-slug-team-2",
    });
  });
});
