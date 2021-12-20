const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test API Users/ResetPassword", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("user_can_reset_password", async () => {
    let respondResult;
    let decoded;
    try {
      const app = httpServer();

      await usersRepo.requestAttributeVerificationForResetPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
      });

      let verification =
        await verificationsRepo.findVerificationForResetPassword({
          attribute_type: contextClassRef.userPayload.type,
          attribute_value: contextClassRef.userPayload.value,
        });

      const payload = {
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: "Brand New",
        token: verification.token,
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/reset-password", // This should be in endpoints.js
        payload,
      });

      authResult = await usersRepo.authenticateWithPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: "Brand New",
      });

      decoded = await decodeJWT(authResult);
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(decoded.sub).toBe(contextClassRef.user.uuid);
    expect(respondResult.json()).toEqual(
      expect.objectContaining({
        message: "Verification Successful",
      })
    );
    // expect(respondResult.json()).toMatchObject({});
    // expect(1).toBe(1);
  });
});
