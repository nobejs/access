module.exports = (app) => {
  app.get("/liveness", async (req, res) => {
    return res.code(200).send({ status: "Access service is alive" });
  });

  app.get("/readiness", async (req, res) => {
    return res.code(200).send({ status: "Access service is ready" });
  });

  return [
    {
      endpoints: [
        ["post", "/register", "Users/CanRegister"],
        [
          "post",
          "/request-verify-registration",
          "Users/RequestVerifyRegistration",
        ],
        ["post", "/verify-registration", "Users/VerifyRegistration"],
        ["post", "/login", "Users/CanLogin"],
        ["get", "/user", "Users/ViewLoggedInUser"],
        ["get", "/verify", "Users/ViewLoggedInUser"],
        ["post", "/teams", "Teams/UserCanCreateTeam"],
      ],
    },
  ];
};
