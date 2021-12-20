const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");
describe("Test API Users/RequestResetPassword", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("registered_user_can_request_otp", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        type: contextClassRef.userPayload.type,
        value: contextClassRef.userPayload.value,
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/request-reset-password", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    // expect(respondResult.json()).toMatchObject({});

    expect(respondResult.json()).toEqual(
      expect.objectContaining({
        message: "Request for verification successfully",
      })
    );
  });
});
