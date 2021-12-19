const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const debugLogger = requireUtil("debugLogger");
const usersRepo = requireRepo("users");

describe("Test API Teams/UserCanViewTeams", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("user_can_get_his_teams", async () => {
    let respondResult;
    try {
      const app = httpServer({ logger: true });

      let headers = contextClassRef.headers;

      result = await app.inject({
        method: "get",
        url: "/teams?tenant=handler-test", // if no tenant is passed we get teams for all tenants
        headers,
      });

      respondResult = result;
    } catch (error) {
      console.log("test-error", error);
      respondResult = error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.user.uuid,
          "teams*uuid": contextClassRef.testTeam.uuid,
        }),
      ])
    );
  });

  it("user_with_no_teams_for_requested_tenant_should_get_zero_teams", async () => {
    let respondResult;
    try {
      const { token } = await usersRepo.createTestUserWithVerifiedToken({
        type: "email",
        value: "rajesh@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      tokenOfuserWithNoTeam = token;

      const app = httpServer({ logger: true });
      let headers = {
        Authorization: `Bearer ${tokenOfuserWithNoTeam}`,
      };

      result = await app.inject({
        method: "get",
        url: "/teams?tenant=handler-test", // if no tenant is passed we get teams for all tenants
        headers,
      });
      respondResult = result;
    } catch (error) {
      debugLogger(error);
      respondResult = error;
    }
    expect(respondResult.json()).toHaveLength(0);
  });
});
