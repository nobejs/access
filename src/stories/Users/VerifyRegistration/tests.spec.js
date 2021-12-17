const debugLogger = requireUtil("debugLogger");
const verificationsRepo = requireRepo("verifications");
const attributesRepo = requireRepo("attributes");

describe("Test Handler Users/Verify", () => {
  it("user_can_verify_registration", async () => {
    let result = {};
    let attributeCount = 0;
    try {
      result = await testStrategy("Users/CanRegister", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          password: "AnotherPassword",
        },
      });

      let verification = await verificationsRepo.first({
        attribute_type: "email",
        attribute_value: "rajiv@betalectic.com",
      });

      result = await testStrategy("Users/VerifyRegistration", {
        prepareResult: {
          type: "email",
          value: "rajiv@betalectic.com",
          token: verification.token,
        },
      });

      attributeCount = await attributesRepo.countAll({
        type: "email",
        value: "rajiv@betalectic.com",
      });
    } catch (error) {
      debugLogger(error);
    }

    expect(attributeCount).toBe(1);
  });
});
