const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const decodeJWT = requireFunction("JWT/decodeJWT");
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler Users/UpdateUserProfile", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });
  it("user_can_update_profile", async () => {
    let result = {};
    try {
      decoded = await decodeJWT(contextClassRef.token);

      result = await testStrategy("Users/UpdateUserProfile", {
        prepareResult: {
          jti: decoded.jti,
          name: "Rajiv Seelam",
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      uuid: decoded.sub,
      attributes: expect.any(Object),
    });

    expect(respondResult.profile).toMatchObject({
      name: "Rajiv Seelam",
    });
  });
});
