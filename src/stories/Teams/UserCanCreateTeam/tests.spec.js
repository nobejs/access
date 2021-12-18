const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");

describe("Handler UserCanCreateTeam", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("tokens").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();
  });

  it("user_can_create_a_team", async () => {
    let respondResult;
    try {
      result = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "handler-test",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      total_team_members: 1,
    });
  });

  it("user_can_create_a_team_with_same_slug_under_different_tenant", async () => {
    let respondResult;
    try {
      result = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "praise",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });
      respondResult = result.respondResult;
    } catch (error) {}
    expect(respondResult).toMatchObject({ uuid: expect.any(String) });
  });

  it("user_should_not_be_able_create_a_team_with_same_slug_under_same_tenant", async () => {
    let respondResult;
    try {
      result = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "handler-test",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });
      respondResult = result.respondResult;

      result = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "handler-test",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toEqual(
      expect.objectContaining({
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });

  it("user_should_be_able_create_a_team_with_different_slug_under_same_tenant", async () => {
    let respondResult;
    try {
      result = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "handler-test",
          name: "Rajiv's Personal Team-2",
          slug: "rajiv-personal-team-2",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });
      respondResult = result.respondResult;

      result = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "handler-test",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });
      respondResult = result.respondResult;
    } catch (error) {
      respondResult = error;
    }

    expect(respondResult).toMatchObject({
      uuid: expect.any(String),
      total_team_members: 1,
    });
  });
});
