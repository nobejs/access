const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const usersRepo = requireRepo("users");

describe("Test API Teams/UserCanViewTeam", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("user_can_view_his_team", async () => {
    let respondResult;
    try {
      const app = httpServer();
      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/${contextClassRef.testTeam.uuid}`,
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      uuid: expect.any(String),
      creator_user_uuid: contextClassRef.user.uuid,
    });
  });

  it("user_cannot_view_the_team_he_is_not_a_member_of", async () => {
    let respondResult;
    try {
      const { token } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "rajesh@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      const app = httpServer();
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      respondResult = await app.inject({
        method: "GET",
        url: `/teams/${contextClassRef.testTeam.uuid}`,
        headers,
      });
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(404);
    expect(respondResult.json()).toMatchObject({
      message: "Invalid Member",
    });
  });
});
