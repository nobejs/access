const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");

describe("Handler UserCanCreateTeam", () => {
  beforeEach(async () => {
    await knex("teams").truncate();
    // await knex("team_members").truncate();
  });

  it("an user can create a team", async () => {
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
});
