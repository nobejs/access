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

server.addHook("onSend", function (request, reply, payload, next) {
  console.log("request.url", request.url);
  console.log("request.headers", request.headers);
  reply.header("Access-Control-Allow-Origin", request.headers.host);
  next();
});

server.register(require('fastify-cors'), {
  origin: ['https://access.staging.teurons.com', "https://api.staging.teurons.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Client-Identifier,X-Team-Identifier,Access-Control-Allow-Origin",
  credentials: true,
  maxAge: 1728000
})

// No 'Access-Control-Allow-Origin' header is present on the requested resource.

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
