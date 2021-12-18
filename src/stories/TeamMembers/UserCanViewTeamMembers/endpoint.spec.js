const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const debugLogger = requireUtil("debugLogger");

describe("Handler UserCanViewTeamMembers", () => {
  beforeAll(async () => {
    contextClassRef.user = randomUser();
    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.user.token}`,
    };

    contextClassRef.user2 = randomUser();
    contextClassRef.headers2 = {
      Authorization: `Bearer ${contextClassRef.user2.token}`,
    };

    await knex("teams").truncate();
    await knex("team_members").truncate();
  });

  it.skip("member_should_be_able_to_access_team_members", async () => {
    let response;

    try {
      response = await requireTestFunction("createTeamViaAPI")();
      response = await requireTestFunction("getTeamMembersViaAPI")(
        response.json()["uuid"]
      );
    } catch (error) {
      response = error;
      debugLogger(response.json());
    }

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": contextClassRef.user.user_uuid,
          "team_members*role": "owner",
          "team_members*status": "accepted",
        }),
      ])
    );
  });

  it.skip("non_member_shouldnt_be_able_to_access_team_members", async () => {
    let team1;

    try {
      team1 = await requireTestFunction("createTeamViaAPI")(
        {
          tenant: "api-test",
          name: "Rajiv's Personal Team",
          slug: "rajiv-personal-team-2",
        },
        contextClassRef.headers2
      );

      response = await requireTestFunction("getTeamMembersViaAPI")(
        team1.json()["uuid"]
      );
    } catch (error) {
      response = error;
      debugLogger(response.json());
    }

    expect(response.statusCode).toBe(403);
  });
});
