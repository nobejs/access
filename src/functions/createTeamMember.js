const contextClassRef = requireUtil("contextHelper");
const usersRepo = requireRepo("users");
const teamMembersRepo = requireRepo("teamMembers");

module.exports = async (teamId) => {
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
      status: "invited",
      user_uuid: null,
      permissions: { member: true },
    };

    const teamMember = await teamMembersRepo.createTeamMember(payload);
    contextClassRef.teamMember = teamMember;
    contextClassRef.noTeamUser = user;
    contextClassRef.memberToken = token;

    return { teamMember, token };
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
