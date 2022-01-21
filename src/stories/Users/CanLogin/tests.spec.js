const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const usersRepo = requireRepo("users");
const truncateAllTables = requireFunction("truncateAllTables");

// yarn test -i src/stories/Users/CanLogin/tests.spec.js

describe("Test Handler Users/CanLogin", () => {
  beforeEach(async () => {
    await truncateAllTables();
    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
    });
  });

  it("user_cannot_login_with_wrong_password", async () => {
    let result = {};
    try {
      result = await testStrategy("Users/CanLogin", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          password: "BadPassword",
        },
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toMatchObject({
      statusCode: 422,
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
      statusCode: 422,
      message: "AttributeNotVerified",
    });
  });

  it("user_can_login", async () => {
    let result = {};
    let respondResult = {};
    try {
      result = await testStrategy("Users/CanLogin", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          password: "GoodPassword",
        },
      });
    } catch (error) {
      console.log(error);
      respondResult = error;
    }

    respondResult = result["respondResult"];

    expect(respondResult).toMatchObject({
      access_token: expect.any(String),
    });
  });
});
