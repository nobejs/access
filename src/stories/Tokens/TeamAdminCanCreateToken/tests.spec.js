const debugLogger = requireUtil("debugLogger");
const truncateAllTables = requireFunction("truncateAllTables");
const contextClassRef = requireUtil("contextHelper");
const createUserAndTeam = requireFunction("createUserAndTeam");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Tokens/TeamAdminCanCreateToken", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("team_admin_can_create_token", async () => {
    let result = {};
    try {
      result = await testStrategy("Tokens/TeamAdminCanCreateToken", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          issuer: "user",
          title: "Personal",
          permissions: {
            create_events: true,
          },
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;
    const decoded = await decodeJWT(respondResult.access_token);

    expect(respondResult).toMatchObject({
      access_token: expect.any(String),
    });

    expect(decoded).toMatchObject({
      sub: contextClassRef.testTeam.uuid,
    });
  });
});
