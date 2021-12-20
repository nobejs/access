const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUser = requireFunction("createUser");

describe("Test API Users/UpdateUserProfile", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUser();
  });

  it("user_can_update_profile", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {
        name: "shubham",
      };

      respondResult = await app.inject({
        method: "POST",
        url: "/user", // This should be in endpoints.js
        payload,
        headers: contextClassRef.headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: contextClassRef.user.uuid,
      attributes: expect.any(Object),
    });

    expect(respondResult.json().profile).toMatchObject({
      name: "shubham",
    });
  });
});
