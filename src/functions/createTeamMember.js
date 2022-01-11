const contextClassRef = requireUtil("contextHelper");
const usersRepo = requireRepo("users");
const teamMembersRepo = requireRepo("teamMembers");

module.exports = async (teamId, status = "invited") => {
  try {
    const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
      type: "email",
      value: "jon@betalectic.com",
      password: "GoodPassword",
      purpose: "register",
    });

    let payload = {
      team_uuid: teamId,
      attribute_type: "email",
      attribute_value: "jon@betalectic.com",
      status: status,
      user_uuid:
        // status === "invited" ? null : "515d0ed8-a00d-413a-ac5e-ab729a069ce6",
        status === "invited" ? null : user.uuid,
      permissions: { member: true },
    };

    const teamMember = await teamMembersRepo.createTeamMember(payload);
    contextClassRef.teamMember = teamMember;
    contextClassRef.memberToken = token;
    contextClassRef.noTeamUser = user;

    return { teamMember, token };
  } catch (error) {
    // console.log("error", error);
    throw error;
  }
};
