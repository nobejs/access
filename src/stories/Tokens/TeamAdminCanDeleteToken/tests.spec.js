const debugLogger = requireUtil("debugLogger");
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");
const tokensRepo = requireRepo("tokens");
const knex = requireKnex();
const contextClassRef = requireUtil("contextHelper");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Tokens/TeamAdminCanDeleteToken", () => {

  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("tokens").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();

    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "rajiv@betalectic.com",
      password: "GoodPassword",
      purpose: "register",
    });
    contextClassRef.user = user;
    contextClassRef.token = token;

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

  it("team_admin_can_delete_token", async () => {
    let result = {};
    try {

      const token = await tokensRepo.createTokenForTeam({
        team_uuid: contextClassRef.testTeam.uuid,
        title: "Personal",
        permissions: {
          "create_events": true
        }
      });

      const decodedUserToken = await decodeJWT(contextClassRef.token);

      // console.log("token", decodedUserT oken)

      result = await testStrategy("Tokens/TeamAdminCanDeleteToken", {
        prepareResult: {
          jti: decodedUserToken.jti,
          sub: decodedUserToken.sub,
          issuer: decodedUserToken.iss,
          team_uuid: contextClassRef.testTeam.uuid
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(respondResult).toMatchObject({
      message: "Token deleted Successfully"
    });
  });
});
