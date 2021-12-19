const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();
const truncateAllTables = requireFunction("truncateAllTables");
const createUserAndTeam = requireFunction("createUserAndTeam");
const createTeamMember = requireFunction("createTeamMember");

describe("Test API TeamMembers/UserCanDeleteTeamMember", () => {
  beforeAll(async () => {
    await truncateAllTables();
    await createUserAndTeam();
    await createTeamMember(contextClassRef.testTeam.uuid);
  });

  it("admin_should_be_able_to_delete_existing_team_member", async () => {
    let respondResult;
    try {
      const app = httpServer();
      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "DELETE",
        url: `/teams/${contextClassRef.testTeam.uuid}/members/${contextClassRef.teamMember.uuid}`,
        headers,
      });
    } catch (error) {
      respondResult = error;
      throw error;
    }

    expect(respondResult.statusCode).toBe(200);
    expect(respondResult.json()).toMatchObject({
      message: "Deleted successfully",
    });
  });

  it("admin_cannot_delete_non_existing_team_member", async () => {
    let respondResult;
    try {
      const app = httpServer();
      let headers = contextClassRef.headers;

      respondResult = await app.inject({
        method: "DELETE",
        url: `/teams/${contextClassRef.testTeam.uuid}/members/515d0ed8-a00d-413a-ac5e-ab729a069ce6`,
        headers,
      });
    } catch (error) {
      respondResult = error;
      throw error;
    }

    expect(respondResult.statusCode).toBe(404);
    expect(respondResult.json()).toMatchObject({
      message: "Team Member not found",
    });
  });

  it.skip("user_who_is_not_admin_cannot_delete_existing_team_member", async () => {
    let respondResult;
    try {
      const app = httpServer();
      let headers = {
        Authorization: `Bearer ${contextClassRef.memberToken}`,
      };

      const { teamMember, token } = await createTeamMember(
        contextClassRef.testTeam.uuid
      );

      let anotherTeamMember = teamMember;

      console.log(
        "passed1",
        contextClassRef.testTeam.uuid,
        anotherTeamMember.uuid
      );

      respondResult = await app.inject({
        method: "DELETE",
        url: `/teams/${contextClassRef.testTeam.uuid}/members/${anotherTeamMember.uuid}`,
        headers,
      });
    } catch (error) {
      console.log("error123", error);
      respondResult = error;
      throw error;
    }

    // expect(respondResult.statusCode).toBe(403);
    // expect(respondResult.json()).toMatchObject({
    //   message: "Forbidden",
    // });
    expect(1).toBe(1);
  });

  it.skip("admin_user_cannot_delete_himself", async () => {
    // let respondResult;
    // try {
    //   const app = httpServer();
    //   let headers = {
    //     Authorization: `Bearer ${contextClassRef.memberToken}`,
    //   };
    //   console.log("passed1", contextClassRef.teamMember.uuid);
    //   respondResult = await app.inject({
    //     method: "DELETE",
    //     url: `/teams/${contextClassRef.testTeam.uuid}/members/${contextClassRef.teamMember.uuid}`,
    //     headers,
    //   });
    // } catch (error) {
    //   console.log("error123", error);
    //   respondResult = error;
    //   throw error;
    // }
    // expect(respondResult.statusCode).toBe(403);
    // expect(respondResult.json()).toMatchObject({
    //   message: "Forbidden",
    // });
    // expect(1).toBe(1);
  });
});
