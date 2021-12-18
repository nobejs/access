const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");
const httpServer = requireHttpServer();
const verificationsRepo = requireRepo("verifications");
const attributesRepo = requireRepo("attributes");
const usersRepo = requireRepo("users");

describe("Test API Users/Verify", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
  });
  it("user_can_verify_registration", async () => {
    let respondResult;
    let attributeCount;
    let verification;
    try {
      const app = httpServer();

      await usersRepo.registerWithPassword({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "AnotherPassword",
      });

      let verification = await verificationsRepo.findVerificationForRegistration({
        attribute_type: "email",
        attribute_value: "rajiv@betalectic.com",
      });

      respondResult = await app.inject({
        method: "POST",
        url: "/verify-registration", // This should be in endpoints.js
        payload: {
          type: "email",
          value: "rajiv@betalectic.com",
          token: verification.token,
        },
      });

      attributeCount = await attributesRepo.countAll({
        type: "email",
        value: "rajiv@betalectic.com",
      });

      verification = await verificationsRepo.findVerificationForRegistration({
        attribute_type: "email",
        attribute_value: "rajiv@betalectic.com",
      });
    } catch (error) {
      respondResult = error;
    }

    // debugLogger(respondResult)

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      message: "Verification Successful",
    });
    expect(attributeCount).toBe(1);
    expect(verification).toBeUndefined();
  });
});
