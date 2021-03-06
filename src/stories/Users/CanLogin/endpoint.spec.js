const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const usersRepo = requireRepo("users");

// yarn test -i src/stories/Users/CanLogin/endpoint.spec.js

describe("Test API Users/CanLogin", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("attributes").truncate();

    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
    });

    contextClassRef.token = token;
    contextClassRef.user = user;

    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.token}`,
    };
  });

  it("user_can_login", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        type: "email",
        value: "rajiv@betalectic.com",
        password: "GoodPassword",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/login", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      access_token: expect.any(String),
    });
  });

  it("user_cannot_login_with_wrong_password", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        type: "email",
        value: "rajiv@betalectic.com",
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

    expect(respondResult.statusCode).toBe(422);
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

    expect(respondResult.statusCode).toBe(422);
    expect(respondResult.json()).toMatchObject({
      message: "AttributeNotRegistered",
    });
  });
});
