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
        ["post", "/request-verify", "Users/RequestVerify"],
        ["post", "/verify", "Users/Verify"],
        ["post", "/login", "Users/CanLogin"],
        ["get", "/user", "Users/ViewLoggedInUser"],
        ["get", "/verify", "Users/ViewLoggedInUser"],
      ],
    },
  ];
};
