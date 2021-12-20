const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const usersRepo = requireRepo("users");

describe("Test Handler Users/GetSessions", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("get_user_sessions", async () => {
    let result = {};
    try {
      authResult = await usersRepo.authenticateWithPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: contextClassRef.userPayload.password,
      });

      result = await testStrategy("Users/GetSessions", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          issuer: "user",
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;

    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "tokens*uuid": expect.any(String),
          "tokens*issuer": "user",
        }),
      ])
    );
  });
});
