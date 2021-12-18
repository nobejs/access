const debugLogger = requireUtil("debugLogger");
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Tokens/TeamAdminCanCreateToken", () => {

  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("tokens").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();

    const { user } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
      purpose: "register",
    });
    contextClassRef.user = user;

    const testTeam = await teamsRepo.createTestTeamForUser(
      {
        tenant: "handler-test",
        name: "Rajiv's Personal Team",
        slug: "rajiv-personal-team",
        creator_user_uuid: contextClassRef.user.uuid,
      },
      contextClassRef.user.uuid
    );
    contextClassRef.testTeam = testTeam;

  });

  it("team_admin_can_create_token", async () => {
    let result = {};
    try {
      result = await testStrategy("Tokens/TeamAdminCanCreateToken", {
        prepareResult: {
          sub: contextClassRef.user.uuid,
          team_uuid: contextClassRef.testTeam.uuid,
          title: "Personal",
          permissions: {
            "create_events": true
          }
        },
      });
    } catch (error) {
      debugLogger(error);
    }

    const { respondResult } = result;
    const decoded = await decodeJWT(respondResult.token);

    expect(respondResult).toMatchObject({
      token: expect.any(String),
    });

    expect(decoded).toMatchObject({
      sub: contextClassRef.testTeam.uuid,
    });
  });
});
