const Config = require("./config")();
const httpServer = requireHttpServer();
const rabbitSendMessage = requireUtil("rabbitSendMessage");
const contextClassRef = requireUtil("contextHelper");

const server = httpServer({
  trustProxy: true,
});

server.addHook("onRequest", async (req, reply) => {
  contextClassRef.client = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
});

server.listen(process.env.PORT || 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
