const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const usersRepo = requireRepo("users");
const tokensRepo = requireRepo("tokens");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Users/DestroySession", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });
  it("user_cannot_delete_session", async () => {
    let result = {};
    let respondResult = {};
    try {
      let decoded = await decodeJWT(contextClassRef.token);

      result = await testStrategy("Users/DestroySession", {
        prepareResult: {
          sub: decoded.sub,
          jti: decoded.jti,
          issuer: decoded.iss,
          session_uuid: decoded.jti,
        },
      });
    } catch (error) {
      respondResult = error;
    }
    expect(respondResult.statusCode).toBe(403);
  });

  it("user_can_delete_session", async () => {
    let result = {};
    let tokensCount = 0;

    try {
      let decoded = await decodeJWT(contextClassRef.token);

      authResult = await usersRepo.authenticateWithPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: contextClassRef.userPayload.password,
      });

      let decodedNew = await decodeJWT(authResult);

      result = await testStrategy("Users/DestroySession", {
        prepareResult: {
          sub: decoded.sub,
          jti: decoded.jti,
          issuer: decoded.iss,
          session_uuid: decodedNew.jti,
        },
      });

      tokensCount = await tokensRepo.countAll({
        sub: decoded.sub,
      });
    } catch (error) {
      respondResult = error;
    }

    const { respondResult } = result;

    expect(tokensCount).toBe(1);

    expect(respondResult).toEqual(
      expect.objectContaining({
        message: "Successfully deleted",
      })
    );
  });
});
