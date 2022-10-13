const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const usersRepo = requireRepo("users");
const verificationsRepo = requireRepo("verifications");
const truncateAllTables = requireFunction("truncateAllTables");

// yarn test -i src/stories/Users/RequestVerifyRegistration/tests.spec.js

describe("Test Handler Users/RequestVerify", () => {
  beforeEach(async () => {
    await truncateAllTables();
  });

  it("user_cannot_request_verification_if_not_already_registered", async () => {
    let result = {};
    let respondResult = {};
    try {
      result = await testStrategy("Users/RequestVerifyRegistration", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
        },
      });
    } catch (error) {
      respondResult = error;
      // debugLogger(error);
    }

    expect(respondResult).toEqual(
      expect.objectContaining({
        errorCode: "InputNotValid",
        // message: expect.stringMatching("Not registered yet"),
      })
    );
  });

  it("user_can_request_code_if_registered", async () => {
    let result = {};
    try {
      await usersRepo.registerWithPassword({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "AnotherPassword",
      });

      result = await testStrategy("Users/RequestVerifyRegistration", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          verification_method: "otp",
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toEqual(
      expect.objectContaining({
        message: "Request for verification successfully",
      })
    );
  });

  it("user_can_re-request_code_if_registered", async () => {
    let result = {};
    let firstRequest = {};
    let secondRequest = {};
    let verificationCounts = {};

    try {
      await usersRepo.registerWithPassword({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "AnotherPassword",
      });

      firstRequest = await verificationsRepo.findVerificationForRegistration({
        attribute_type: "email",
        attribute_value: "rajiv@betalectic.com",
      });

      // console.log("firstRequest", firstRequest);

      result = await testStrategy("Users/RequestVerifyRegistration", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          verification_method: "otp",
        },
      });

      secondRequest = await verificationsRepo.findVerificationForRegistration({
        attribute_type: "email",
        attribute_value: "rajiv@betalectic.com",
      });

      verificationCounts = await verificationsRepo.countAll();
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;

    console.log("respondResult", respondResult);

    console.log(firstRequest, secondRequest, verificationCounts);

    expect(firstRequest.expires_at).not.toBe(secondRequest.expires_at);

    expect(respondResult).toEqual(
      expect.objectContaining({
        // errorCode: "InputNotValid",
        message: "Request for verification successfully",
      })
    );

    expect(verificationCounts).toBe(1);
  });

  it("user_cannot_request_verification_if_not_already_registered_2", async () => {
    let result = {};
    let respondResult = {};
    try {
      await usersRepo.registerWithPassword({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "AnotherPassword",
      });

      result = await testStrategy("Users/RequestVerifyRegistration", {
        prepareResult: {
          type: "email",
          value: "rajiv+1@betalectic.com",
        },
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toEqual(
      expect.objectContaining({
        errorCode: "InputNotValid",
        // message: expect.stringMatching("Not registered yet"),
      })
    );
  });
});
