const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const debugLogger = requireUtil("debugLogger");
const usersRepo = requireRepo("users");

// yarn test -i src/stories/Users/RequestVerifyRegistration/endpoint.spec.js

describe("Test API Users/RequestVerifyRegistration", () => {
  beforeAll(async () => {});

  it("call_endpoint_with_empty_payload", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {};

      respondResult = await app.inject({
        method: "POST",
        url: "/request-verify-registration", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(422);
    expect(respondResult.json()).toEqual(
      expect.objectContaining({
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });

  it("user_can_request_code_if_registered", async () => {
    let respondResult;
    try {
      await usersRepo.registerWithPassword({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "AnotherPassword",
      });

      const app = httpServer();

      const payload = {
        type: "email",
        value: "rajiv@betalectic.com",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/request-verify-registration", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
      expect.objectContaining({
        message: "Request for verification successfully",
      })
    );
  });

  it.skip("user_cannot_otp_after_3_times_within_10_minutes", async () => {});
});
