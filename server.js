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

server.addHook("onRequest", function (request, reply, next) {
  console.log("request.url", request.url, request.method);
  console.log("request.headers.origin", request.headers.origin);

  if (request.headers.origin) {
    reply.header("Access-Control-Allow-Origin", request.headers.origin);
  }

  reply.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Client-Identifier,X-Team-Identifier");
  reply.header("Access-Control-Allow-Credentials", "true");

  if (request.method === "OPTIONS") {
    reply.header("Content-Type", "text/plain charset=UTF-8");
    reply.header("Content-Length", "0");
    reply.header("Access-Control-Max-Age", "1728000");
    reply.code(204)
    reply.send();
  } else {
    next();
  }

});

// server.register(require('fastify-cors'), {
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Client-Identifier,X-Team-Identifier,Access-Control-Allow-Origin",
//   credentials: true,
// })

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
