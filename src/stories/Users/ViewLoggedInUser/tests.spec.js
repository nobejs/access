const debugLogger = requireUtil("debugLogger");
const tokensRepo = requireRepo("tokens");
const decodeJWT = requireFunction("JWT/decodeJWT");
const usersRepo = requireRepo("users");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler Users/ViewLoggedInUser", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("attributes").truncate();

    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
    });

    contextClassRef.user = user;
  });

  it("logged_in_user_can_fetch_user_object", async () => {
    let result = {};
    let decoded = {};
    try {
      let token = await tokensRepo.createTokenForUser(contextClassRef.user);

      decoded = await decodeJWT(token);

      result = await testStrategy("Users/ViewLoggedInUser", {
        prepareResult: {
          jti: decoded.jti,
        },
      });
    } catch (error) {
      throw error;
    }

    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      uuid: decoded.sub,
      attributes: expect.any(Object),
    });
  });
});
