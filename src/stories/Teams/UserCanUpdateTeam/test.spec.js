const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");
const contextClassRef = requireUtil("contextHelper");
const TeamsRepo = requireRepo("teams");
const UsersRepo = requireRepo("users");
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = require("../createUserAndTeam");

describe("Handler UserCanUpdateTeam", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
  });

  it("a_user_can_update_a_team", async () => {
    let respondResult;
    let createTeamResult;
    try {
      createTeamResult = contextClassRef.testTeam;

      respondResult = await testStrategy("Teams/UserCanUpdateTeam", {
        prepareResult: {
          team_uuid: createTeamResult.uuid,
          name: "Rajiv's Personal Team 2",
          slug: "rajiv-personal-team-2",
          invoking_user_uuid: createTeamResult.creator_user_uuid,
        },
      });

      respondResult = respondResult.respondResult;
    } catch (error) {
      debugLogger("Error", error);
    }

    expect(respondResult).toMatchObject({
      uuid: createTeamResult.uuid,
      name: "Rajiv's Personal Team 2",
      slug: "rajiv-personal-team-2",
    });
  });

  it("a_user_should_be_able_to_update_team_with_same_slug_but_different_name", async () => {
    let respondResult;
    let createTeamResult;
    try {
      createTeamResult = contextClassRef.testTeam;

      respondResult = await testStrategy("Teams/UserCanUpdateTeam", {
        prepareResult: {
          team_uuid: createTeamResult.uuid,
          name: "Rajiv's Company Team X",
          slug: "rajiv-personal-team",
          invoking_user_uuid: createTeamResult.creator_user_uuid,
        },
      });

      respondResult = respondResult.respondResult;
    } catch (error) {
      debugLogger("Error", error);
    }

    expect(respondResult).toMatchObject({
      uuid: createTeamResult.uuid,
      name: "Rajiv's Company Team X",
      slug: "rajiv-personal-team",
    });
  });

  it("a_user_shouldn't_be_able_to_use_slug_of_another_team_while_updating", async () => {
    let respondResult;
    let uniqueSlugTeamResult;
    try {
      uniqueSlugTeamResult = await TeamsRepo.createTestTeamForUser(
        {
          tenant: "handler-test",
          name: "Rajiv's Unique Slug Team",
          slug: "rajiv-unique-slug-team",
          creator_user_uuid: contextClassRef.user.uuid,
        },
        contextClassRef.user.uuid
      );

      let uniqueSlugTeamTwoResult = await TeamsRepo.createTestTeamForUser(
        {
          tenant: "handler-test",
          name: "Rajiv's Unique Slug Team 2",
          slug: "rajiv-unique-slug-team-2",
          creator_user_uuid: contextClassRef.user.uuid,
        },
        contextClassRef.user.uuid
      );

      respondResult = await testStrategy("Teams/UserCanUpdateTeam", {
        prepareResult: {
          team_uuid: uniqueSlugTeamResult.uuid,
          name: "Rajiv's Change Name drastically",
          slug: "rajiv-unique-slug-team-2",
          invoking_user_uuid: uniqueSlugTeamResult.creator_user_uuid,
        },
      });

      respondResult = respondResult.respondResult;
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toEqual(
      expect.objectContaining({
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });
});
