const contextClassRef = requireUtil("contextHelper");
const knex = requireKnex();
const httpServer = requireHttpServer();
const usersRepo = requireRepo("users");

describe("Test API Users/Authorize", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();

    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
      purpose: "register",
    });

    contextClassRef.token = token;
    contextClassRef.user = user;

    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.token}`,
    };
  });

  it("logged_in_user_can_call_authorize", async () => {
    let respondResult;
    try {
      const app = httpServer();

      respondResult = await app.inject({
        method: "GET",
        url: "/authorize", // This should be in endpoints.js
        headers: contextClassRef.headers,
      });
    } catch (error) {
      respondResult = error;
    }

    // console.log("respondResult", respondResult.statusCode);
    // console.log("respondResult", respondResult.json());

    expect(respondResult.statusCode).toBe(200);
  });
  it.skip("logged_in_user_and_member_of_team_can_authorize", async () => { });
  it.skip("valid_token_can_authorize", async () => { });
});
