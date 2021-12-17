const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const verificationsRepo = requireRepo("verifications");
const attributesRepo = requireRepo("attributes");
describe("Test API Users/Verify", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
  });
  it("user_can_verify_registration", async () => {
    let respondResult;
    let attributeCount;
    let verificationCount;
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

      let verification = await verificationsRepo.first({
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

      verificationCount = await verificationsRepo.countAll({
        attribute_type: "email",
        attribute_value: "rajiv@betalectic.com",
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      message: "Verification Successful",
    });
    expect(attributeCount).toBe(1);
    expect(verificationCount).toBe(0);
  });
});
