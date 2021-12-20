const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const usersRepo = requireRepo("users");

describe("Test API Users/GetSessions", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("get_user_sessions", async () => {
    let respondResult;
    try {
      const app = httpServer();

      authResult = await usersRepo.authenticateWithPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: contextClassRef.userPayload.password,
      });

      const payload = {};

      respondResult = await app.inject({
        method: "GET",
        url: "/sessions", // This should be in endpoints.js
        headers: contextClassRef.headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "tokens*uuid": expect.any(String),
          "tokens*issuer": "user",
        }),
      ])
    );
  });
});
