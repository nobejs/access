const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const tokensRepo = requireRepo("tokens");
const usersRepo = requireRepo("users");
const debugLogger = requireUtil("debugLogger");

describe("Test API Users/ViewLoggedInUser", () => {
  beforeAll(async () => {
    await knex("users").truncate();
    await knex("attributes").truncate();

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

  it("logged_in_user_can_fetch_user_object", async () => {
    let respondResult;
    let user;
    try {
      const app = httpServer();

      let token = await tokensRepo.createTokenForUser(contextClassRef.user);

      respondResult = await app.inject({
        method: "GET",
        url: "/user",
        headers: {
          Authorization: `Bearer ${contextClassRef.token}`,
        },
      });
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: contextClassRef.user.uuid,
    });
  });

  it("test_invalid_user_token", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let user = randomUser();

      respondResult = await app.inject({
        method: "GET",
        url: "/user",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(401);
    expect(respondResult.json()).toMatchObject({ message: "Unauthenticated" });
  });

  it("test_valid_token_invalid_jti", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let token = await tokensRepo.createTokenForUser(contextClassRef.user);

      console.log(token);

      await tokensRepo.deleteTokenByConstraints({
        sub: contextClassRef.user.uuid,
      });

      respondResult = await app.inject({
        method: "GET",
        url: "/user",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(401);
    expect(respondResult.json()).toMatchObject({ message: "Unauthenticated" });
    // expect(1).toBe(1);
  });
});
