const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test API Tokens/TeamAdminCanCreateToken", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("tokens").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();

    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
      purpose: "register",
    });
    contextClassRef.user = user;
    contextClassRef.token = token;

    const testTeam = await teamsRepo.createTestTeamForUser(
      {
        tenant: "handler-test",
        name: "Rajiv's Personal Team",
        slug: "rajiv-personal-team",
        creator_user_uuid: contextClassRef.user.uuid,
      },
      contextClassRef.user.uuid
    );
    contextClassRef.testTeam = testTeam;

    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.token}`,
    };

  });

  it("team_admin_can_create_token", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        title: "Personal",
        permissions: {
          "create_events": true
        }
      };

      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "POST",
        url: `/teams/${contextClassRef.testTeam.uuid}/tokens`, // This should be in endpoints.js
        payload,
        headers,
      });

    } catch (error) {
      respondResult = error;
      console.log("error", error)
    }

    console.log(respondResult.statusCode, respondResult.json())

    const decoded = await decodeJWT(respondResult.json().token);


    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      token: expect.any(String),
    });

    expect(decoded).toMatchObject({
      sub: contextClassRef.testTeam.uuid,
    });
  });
});
