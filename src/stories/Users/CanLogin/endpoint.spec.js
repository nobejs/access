const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const createVerifiedUser = testHelper("createVerifiedUser");

// yarn test -i src/stories/Users/CanLogin/endpoint.spec.js

describe("Test API Users/CanLogin", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("attributes").truncate();
  });

  it("user_cannot_login_with_wrong_password", async () => {
    let respondResult;
    try {
      const app = httpServer();

      await createVerifiedUser({
        type: "email",
        value: "rajiv+7@betalectic.com",
        password: "GoodPassword",
      });

      const payload = {
        type: "email",
        value: "rajiv+7@betalectic.com",
        password: "BadPassword",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/login", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(401);
    expect(respondResult.json()).toMatchObject({
      message: "Invalid Username or Password",
    });
  });

  it("user_cannot_login_with_invalid_credentials", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        type: "email",
        value: "rajiv+7@betalectic.com",
        password: "BadPassword",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/login", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(401);
    expect(respondResult.json()).toMatchObject({
      message: "Invalid Username or Password",
    });
  });
});
