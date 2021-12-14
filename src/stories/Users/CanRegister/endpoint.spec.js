const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();

describe("Test API Users/CanRegister", () => {
  beforeAll(async () => {
    contextClassRef.user = randomUser();
    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.user.token}`, // An authenticated user is making the api call
    };
  });

  it("dummy_story_which_will_pass", async () => {
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
