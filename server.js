const Config = require("./config")();
const httpServer = requireHttpServer();
const rabbitSendMessage = requireUtil("rabbitSendMessage");
const contextClassRef = requireUtil("contextHelper");

const server = httpServer({
  trustProxy: true,
  rewriteUrl: (req) => {
    if (process.env.URL_PREFIX !== "") {
      let newUrl = req.url.replace(process.env.URL_PREFIX, "");
      return newUrl;
    } else {
      return req.url;
    }
  },
});

server.register(require('fastify-cors'), {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Client-Identifier,X-Team-Identifier",
  credentials: true,
  maxAge: 1728000
})

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
