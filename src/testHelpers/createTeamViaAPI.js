const contextClassRef = requireUtil("contextHelper");
const httpServer = requireHttpServer();
const TeamRepo = requireRepo("teams");

module.exports = async (
  payload = {
    tenant: "api-test",
    name: "Rajiv's Personal Team",
    slug: "rajiv-personal-team",
  },
  userUuid
) => {
  try {
    let result = await TeamRepo.createTeamForAUser(payload);

    payload["creator_user_uuid"] = userUuid;

    console.log("result221", result);

    return result.json();
  } catch (error) {
    throw error;
  }
};
