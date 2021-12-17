const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const createVerifiedUser = testHelper("createVerifiedUser");
const tokensRepo = requireRepo("tokens");
const debugLogger = requireUtil("debugLogger");

describe("Test API Users/ViewLoggedInUser", () => {
  beforeAll(async () => {
    contextClassRef.user = randomUser();
    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.user.token}`, // An authenticated user is making the api call
    };
  });

  it("logged_in_user_can_fetch_user_object", async () => {
    let respondResult;
    let user;
    try {
      const app = httpServer();

      user = await createVerifiedUser({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      let token = await tokensRepo.createTokenForUser(user);

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

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: user.uuid,
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

      let user = await createVerifiedUser({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      let token = await tokensRepo.createTokenForUser(user);
      await tokensRepo.remove({ sub: user.uuid });

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
