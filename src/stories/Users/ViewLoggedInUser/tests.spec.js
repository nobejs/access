const debugLogger = requireUtil("debugLogger");
const tokensRepo = requireRepo("tokens");
const decodeJWT = requireFunction("JWT/decodeJWT");
const usersRepo = requireRepo("users");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");

describe("Test Handler Users/ViewLoggedInUser", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("logged_in_user_can_fetch_user_object", async () => {
    let result = {};
    let decoded = {};
    try {
      decoded = await decodeJWT(contextClassRef.token);

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
