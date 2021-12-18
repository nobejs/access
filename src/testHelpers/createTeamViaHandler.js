const contextClassRef = requireUtil("contextHelper");
const httpServer = requireHttpServer();

module.exports = async (
  payload = {
    tenant: "handler-test",
    name: "Rajiv's Personal Team",
    slug: "rajiv-personal-team",
    creator_user_uuid: "1098c53c-4a86-416b-b5e4-4677b70f5dfa",
  }
) => {
  try {
    createTeamResult = await testStrategy("Teams/UserCanCreateTeam", {
      prepareResult: payload,
    });

    return result.respondResult;
  } catch (error) {
    throw error;
  }
};
