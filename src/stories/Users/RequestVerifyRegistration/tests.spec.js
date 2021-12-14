const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const usersRepo = requireRepo("users");

// yarn test -i src/stories/Users/RequestVerifyRegistration/tests.spec.js

describe("Test Handler Users/RequestVerify", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
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
        statusCode: 422,
        errorCode: expect.stringMatching("InputNotValid"),
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
        statusCode: 422,
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });
});
