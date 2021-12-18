const contextClassRef = requireUtil("contextHelper");
const teamsRepo = requireRepo("teams");
const usersRepo = requireRepo("users");

module.exports = async () => {
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

  contextClassRef.headers = {
    Authorization: `Bearer ${contextClassRef.token}`,
  };
};
