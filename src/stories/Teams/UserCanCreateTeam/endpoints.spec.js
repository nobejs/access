const createUserWithVerifiedToken = testHelper("createUserWithVerifiedToken");
const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();

describe("API UserCanCreateTeam", () => {
  beforeEach(async () => {
    const { user, token } = await createUserWithVerifiedToken();
    contextClassRef.token = token;
    contextClassRef.user = user;

    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.token}`,
    };
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();
  });

  it("user_can_create_team", async () => {
    let response;

    try {
      let payload = {
        tenant: "api-test",
        name: "Rajiv's Personal Team",
        slug: "rajiv-personal-team",
      };

      let headers = contextClassRef.headers;
      const app = httpServer();
      result = await app.inject({
        method: "POST",
        url: "/teams",
        payload,
        headers,
      });

      response = result;
    } catch (error) {
      response = error;
    }
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      uuid: expect.any(String),
      name: expect.any(String),
      slug: expect.any(String),
      total_team_members: 1,
      creator_user_uuid: contextClassRef.user.uuid,
    });
  });

  it("user_cannot_create_team_with_same_slug", async () => {
    let response;

    try {
      let payload = {
        tenant: "api-test",
        name: "Rajiv's Personal Team",
        slug: "rajiv-personal-team",
      };

      let headers = contextClassRef.headers;
      const app = httpServer();
      result = await app.inject({
        method: "POST",
        url: "/teams",
        payload,
        headers,
      });
      response = result;

      result = await app.inject({
        method: "POST",
        url: "/teams",
        payload,
        headers,
      });
      response = result;
    } catch (error) {
      response = error;
    }

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual(
      expect.objectContaining({
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });
});
