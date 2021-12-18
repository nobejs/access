const contextClassRef = requireUtil("contextHelper");
const knex = requireKnex();
const httpServer = requireHttpServer();
const usersRepo = requireRepo("users");
const truncateAllTables = requireFunction("truncateAllTables");

describe("API UserCanCreateTeam", () => {
  beforeEach(async () => {
    await truncateAllTables();

    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
    });

    contextClassRef.token = token;
    contextClassRef.user = user;

    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.token}`,
    };
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

      // console.log("headers", headers)

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

    console.log("response.json()", response.json());

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
