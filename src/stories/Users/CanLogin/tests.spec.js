const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const createVerifiedUser = testHelper("createVerifiedUser");

// yarn test -i src/stories/Users/CanLogin/tests.spec.js

describe("Test Handler Users/CanLogin", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("attributes").truncate();
  });

  it("user_cannot_login_with_wrong_password", async () => {
    let result = {};
    try {
      await createVerifiedUser({
        type: "email",
        value: "rajiv+7@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      result = await testStrategy("Users/CanLogin", {
        prepareResult: {
          type: "email",
          value: "rajiv+7@betalectic.com",
          password: "BadPassword",
        },
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toMatchObject({
      statusCode: 401,
      message: "Invalid Username or Password",
    });
  });

  it("user_cannot_login_with_invalid_credentials", async () => {
    let result = {};
    try {
      result = await testStrategy("Users/CanLogin", {
        prepareResult: {
          type: "email",
          value: "doesntexist@betalectic.com",
          password: "BadPassword",
        },
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toMatchObject({
      statusCode: 401,
      message: "Invalid Username or Password",
    });
  });

  it("user_can_login", async () => {
    let result = {};
    try {
      await createVerifiedUser({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      result = await testStrategy("Users/CanLogin", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          password: "GoodPassword",
        },
      });
    } catch (error) {
      respondResult = error;
    }

    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      token: expect.any(String),
    });
  });
});