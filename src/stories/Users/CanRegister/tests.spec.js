const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();

describe("Test Handler Users/CanRegister", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
  });

  it("user_can_register_with_email", async () => {
    let result = {};

    try {
      result = await testStrategy("Users/CanRegister", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          password: "AnotherPassword",
          verification_method: "otp",
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;

    expect(respondResult).toMatchObject({
      message: "Successfully Registered",
    });
  });

  it.skip("user_cannot_register_with_existing_email", async () => {});
});
