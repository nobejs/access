const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");
const contextClassRef = requireUtil("contextHelper");
const attributesRepo = requireRepo("attributes");

describe("Test Handler TeamMembers/UserCanViewInvites", () => {
  beforeEach(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("user_should_be_able_to_see_team_invites", async () => {
    let result = {};
    try {
      await attributesRepo.createAttributeForUUID(
        contextClassRef.noTeamUser.uuid,
        {
          type: "email",
          value: "bob@betalectic.com",
          purpose: "alternate",
        },
        true
      );

      result = await testStrategy("TeamMembers/UserCanViewInvites", {
        prepareResult: {
          tenant: contextClassRef.testTeam.tenant,
          invoking_user_uuid: contextClassRef.noTeamUser.uuid,
        },
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;

    expect(respondResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "team_members*user_uuid": null,
          "team_members*status": "invited",
        }),
      ])
    );
  });

  // it("user_should_be_able_to_see_team_invites_of_other_members", async () => {
  // let result = {};
  // try {
  //   await attributesRepo.createAttributeForUUID(
  //     contextClassRef.noTeamUser.uuid,
  //     {
  //       type: "email",
  //       value: "bob@betalectic.com",
  //       purpose: "alternate",
  //     },
  //     true
  //   );

  //   result = await testStrategy("TeamMembers/UserCanViewInvites", {
  //     prepareResult: {
  //       tenant: contextClassRef.testTeam.tenant,
  //       invoking_user_uuid: contextClassRef.noTeamUser.uuid,
  //     },
  //   });
  // } catch (error) {
  //   debugLogger(error);
  // }
  // const { respondResult } = result;

  // expect(respondResult).toEqual(
  //   expect.arrayContaining([
  //     expect.objectContaining({
  //       "team_members*user_uuid": null,
  //       "team_members*status": "invited",
  //     }),
  //   ])
  // );
  // });
});
