const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test API Users/LoginWithOTP", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("user_can_login_with_otp", async () => {
    let respondResult;
    try {
      const app = httpServer();

      // console.log("contextClassRef.userPayload", contextClassRef.userPayload);

      await usersRepo.generateOTPForLogin({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
      });

      let verification = await verificationsRepo.findVerificationForLogin({
        attribute_type: contextClassRef.userPayload.type,
        attribute_value: contextClassRef.userPayload.value,
      });

      // console.log("verification..", verification);

      const payload = {
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
        token: verification.token,
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/login/otp", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    // console.log("respondResult", respondResult);

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
      })
    );
  });
});
