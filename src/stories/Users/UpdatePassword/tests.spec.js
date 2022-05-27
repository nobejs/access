const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const decodeJWT = requireFunction("JWT/decodeJWT");
const contextClassRef = requireUtil("contextHelper");

describe("Test Handler Users/UpdatePassword", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("can_update_password_and_login", async () => {
    let result = {};
    try {
      decoded = await decodeJWT(contextClassRef.token);

      result = await testStrategy("Users/UpdatePassword", {
        prepareResult: {
          jti: decoded.jti,
          password: "Kissmiss10!",
        },
      });

      result = await testStrategy("Users/CanLogin", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          password: "Kissmiss10!",
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;
    expect(respondResult).toMatchObject({
      access_token: expect.any(String),
    });
  });
});
