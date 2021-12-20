const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
const verificationsRepo = requireRepo("verifications");

describe("Test Handler Users/RequestResetPassword", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("registered_user_can_request_otp", async () => {
    let result = {};
    try {
      result = await testStrategy("Users/RequestResetPassword", {
        prepareResult: {
          type: contextClassRef.userPayload.type,
          value: contextClassRef.userPayload.value,
        },
      });
    } catch (error) {
      // debugLogger(error);
    }
    const { respondResult } = result;
    expect(respondResult).toEqual(
      expect.objectContaining({
        message: "Request for verification successfully",
      })
    );
  });

  it("unregistered_user_cannot_request_otp", async () => {
    let result = {};
    let respondResult = {};
    try {
      result = await testStrategy("Users/RequestResetPassword", {
        prepareResult: {
          type: "email",
          value: "shubham@betalectic.com",
        },
      });
    } catch (error) {
      // debugLogger(error);
      respondResult = error;
    }
    expect(respondResult).toEqual(
      expect.objectContaining({
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });

  it("registered_user_can_request_otp_twice", async () => {
    let result = {};
    let firstRequest = {};
    let secondRequest = {};
    let verificationCounts = {};
    try {
      result = await testStrategy("Users/RequestResetPassword", {
        prepareResult: {
          type: contextClassRef.userPayload.type,
          value: contextClassRef.userPayload.value,
        },
      });

      firstRequest = await verificationsRepo.findVerificationForResetPassword({
        attribute_type: contextClassRef.userPayload.type,
        attribute_value: contextClassRef.userPayload.value,
      });

      result = await testStrategy("Users/RequestResetPassword", {
        prepareResult: {
          type: contextClassRef.userPayload.type,
          value: contextClassRef.userPayload.value,
        },
      });

      secondRequest = await verificationsRepo.findVerificationForResetPassword({
        attribute_type: contextClassRef.userPayload.type,
        attribute_value: contextClassRef.userPayload.value,
      });

      verificationCounts = await verificationsRepo.countAll({
        attribute_type: contextClassRef.userPayload.type,
        attribute_value: contextClassRef.userPayload.value,
      });
    } catch (error) {
      // debugLogger(error);
    }

    const { respondResult } = result;
    expect(respondResult).toEqual(
      expect.objectContaining({
        message: "Request for verification successfully",
      })
    );

    expect(firstRequest.expires_at).not.toBe(secondRequest.expires_at);

    expect(verificationCounts).toBe(1);
  });
});
