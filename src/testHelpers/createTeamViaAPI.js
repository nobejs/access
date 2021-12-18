const contextClassRef = requireUtil("contextHelper");
const httpServer = requireHttpServer();

module.exports = async (
  payload = {
    tenant: "api-test",
    name: "Rajiv's Personal Team",
    slug: "rajiv-personal-team",
  }
) => {
  try {
    const app = httpServer();
    result = await app.inject({
      method: "POST",
      url: "/teams",
      payload,
      headers: contextClassRef.headers,
    });

    return result.json();
  } catch (error) {
    throw error;
  }
};
