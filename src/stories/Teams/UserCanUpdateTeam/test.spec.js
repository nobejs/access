const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");

describe("Handler UserCanUpdateTeam", () => {
  beforeEach(async () => {
    await knex("users").truncate();
    await knex("verifications").truncate();
    await knex("attributes").truncate();
    await knex("teams").truncate();
    await knex("team_members").truncate();
  });

  it("a_user_can_update_a_team", async () => {
    let respondResult;
    let createTeamResult;
    try {
      createTeamResult = await testStrategy("Teams/UserCanCreateTeam", {
        prepareResult: {
          tenant: "handler-test",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team",
          creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
        },
      });

      createTeamResult = createTeamResult.respondResult;

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

  // it("an user should be able to update with same slug", async () => {
  //   let respondResult;
  //   let createTeamResult;
  //   try {
  //     createTeamResult = await requireTestFunction("createTeamViaHandler")({
  //       tenant: "handler-test",
  //       name: "Rajiv's Company Team",
  //       slug: "rajiv-company-team",
  //       creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
  //     });

  //     respondResult = await requireTestFunction("updateTeamViaHandler")({
  //       team_uuid: createTeamResult.uuid,
  //       name: "Rajiv's Company Team X",
  //       slug: "rajiv-company-team",
  //       invoking_user_uuid: createTeamResult.creator_user_uuid,
  //     });
  //   } catch (error) {
  //     debugLogger("Error", error);
  //   }

  //   expect(respondResult).toMatchObject({
  //     uuid: createTeamResult.uuid,
  //     name: "Rajiv's Company Team X",
  //     slug: "rajiv-company-team",
  //   });
  // });

  // it("an shouldn't be able to use slug of another team", async () => {
  //   let respondResult;
  //   let uniqueSlugTeamResult;
  //   try {
  //     uniqueSlugTeamResult = await requireTestFunction("createTeamViaHandler")({
  //       tenant: "handler-test",
  //       name: "Rajiv's Unique Slug Team",
  //       slug: "rajiv-unique-slug-team",
  //       creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
  //     });

  //     uniqueSlugTeam2Result = await requireTestFunction("createTeamViaHandler")(
  //       {
  //         tenant: "handler-test",
  //         name: "Rajiv's Unique Slug Team 2",
  //         slug: "rajiv-unique-slug-team-2",
  //         creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
  //       }
  //     );

  //     respondResult = await requireTestFunction("updateTeamViaHandler")({
  //       team_uuid: uniqueSlugTeamResult.uuid,
  //       name: "Rajiv's Change Name drastically",
  //       slug: "rajiv-unique-slug-team-2",
  //       invoking_user_uuid: uniqueSlugTeamResult.creator_user_uuid,
  //     });
  //   } catch (error) {
  //     respondResult = error;
  //   }

  //   expect(respondResult).toEqual(
  //     expect.objectContaining({
  //       errorCode: expect.stringMatching("InputNotValid"),
  //     })
  //   );
  // });
});
