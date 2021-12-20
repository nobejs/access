const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const usersRepo = requireRepo("users");
const debugLogger = requireUtil("debugLogger");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test API Users/DestroySession", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("user_can_delete_session", async () => {
    let respondResult;
    try {
      const app = httpServer();

      authResult = await usersRepo.authenticateWithPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: contextClassRef.userPayload.password,
      });

      let decodedNew = await decodeJWT(authResult);

      respondResult = await app.inject({
        method: "DELETE",
        url: `/sessions/${decodedNew.jti}`, // This should be in endpoints.js
        headers: contextClassRef.headers,
      });
    } catch (error) {
      respondResult = error;
      debugLogger(error);
    }

    expect(respondResult.statusCode).toBe(200);

    expect(respondResult.json()).toEqual(
      expect.objectContaining({
        message: "Successfully deleted",
      })
    );
  });
});
