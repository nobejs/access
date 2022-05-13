const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const verificationsRepo = requireRepo("verifications");
const usersRepo = requireRepo("users");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Users/LoginWithOTP", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("user_can_login_with_otp", async () => {
    let result = {};
    let authResult = {};
    let decoded = {};
    try {
      await usersRepo.generateOTPForLogin({
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
      });

      let verification = await verificationsRepo.findVerificationForLogin({
        attribute_type: contextClassRef.userPayload.type,
        attribute_value: contextClassRef.userPayload.value,
      });

      result = await testStrategy("Users/LoginWithOTP", {
        prepareResult: {
          type: contextClassRef.userPayload.type,
          value: contextClassRef.userPayload.value,
          token: verification.token,
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    // console.log("result", result);

    // console.log("authResult", contextClassRef.user);

    const { respondResult } = result;

    expect(respondResult).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
      })
    );
  });
});
