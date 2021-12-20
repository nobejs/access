const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const tokensRepo = requireRepo("tokens");
const usersRepo = requireRepo("users");
const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
describe("Test API Users/ViewLoggedInUser", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("logged_in_user_can_fetch_user_object", async () => {
    let respondResult;
    let user;
    try {
      const app = httpServer();

      respondResult = await app.inject({
        method: "GET",
        url: "/user",
        headers: contextClassRef.headers,
      });
    } catch (error) {
      // debugLogger(error);
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: contextClassRef.user.uuid,
      attributes: expect.any(Object),
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
      // debugLogger(error);
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

      // console.log(token);

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
      // debugLogger(error);
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(401);
    expect(respondResult.json()).toMatchObject({ message: "Unauthenticated" });
    // expect(1).toBe(1);
  });
});
