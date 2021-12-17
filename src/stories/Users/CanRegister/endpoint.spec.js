const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();

describe("Test API Users/CanRegister", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
  });

  it("user_can_register_with_email", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        type: "email",
        value: "rajiv@betalectic.com",
        password: "AnotherPassword",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/register", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      message: "Successfully Registered",
    });
  });
});
