const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Users/ResetPassword", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("user_can_reset_password", async () => {
    let result = {};
    let authResult = {};
    let decoded = {};
    try {
      await usersRepo.requestAttributeVerificationForResetPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
      });

      let verification =
        await verificationsRepo.findVerificationForResetPassword({
          attribute_type: contextClassRef.userPayload.type,
          attribute_value: contextClassRef.userPayload.value,
        });

      console.log("verification", verification);

      result = await testStrategy("Users/ResetPassword", {
        prepareResult: {
          type: contextClassRef.userPayload.type,
          value: contextClassRef.userPayload.value,
          password: "Brand New",
          token: verification.token,
        },
      });

      authResult = await usersRepo.authenticateWithPassword({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        password: "Brand New",
      });

      decoded = await decodeJWT(authResult);
    } catch (error) {
      debugLogger(error);
    }

    // console.log("authResult", contextClassRef.user);

    const { respondResult } = result;
    expect(decoded.sub).toBe(contextClassRef.user.uuid);
    expect(respondResult).toEqual(
      expect.objectContaining({
        message: "Verification Successful",
      })
    );
  });
});
