const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");

describe("Test API Users/UpdatePassword", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("can_update_password_and_login", async () => {
    let respondResult;
    try {
      const app = httpServer();

      let payload = {
        password: "Kissmiss10!",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/update-password", // This should be in endpoints.js
        payload,
        headers: contextClassRef.headers,
      });

      payload = {
        type: "email",
        value: "rajiv@betalectic.com",
        password: "Kissmiss10!",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/login", // This should be in endpoints.js
        payload,
      });
    } catch (error) {
      respondResult = error;
    }

    // console.log("respondResult", respondResult);

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      access_token: expect.any(String),
    });
  });
});
