const Config = require("./config")();
const httpServer = requireHttpServer();
const rabbitSendMessage = requireUtil("rabbitSendMessage");
const contextClassRef = requireUtil("contextHelper");
const bootstrapLoco = require("./loco/bootstrap");

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

server.addHook("onRequest", async (req, reply) => {
  contextClassRef.client = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
});

server.addHook("onSend", function (request, reply, payload, next) {
  if (process.env.ENABLE_REQUEST_LOGGING === "true") {
    let apiLog = {
      timestamp: new Date().toISOString(),
      status_code: reply.statusCode,
      http_method: request.method,
      url: `${request.hostname}${request.url}`,
      hostname: request.hostname,
      protocol: request.protocol,
      source: {
        ip: request.ip,
        user_agent: request.headers["user-agent"],
      },
      request_payload: JSON.stringify(request.body),
      response: payload,
      user_uuid: request.user,
      uuid: request.user ? request.user : "",
      meta: {
        id: request.id,
      },
    };

    console.log(
      `ACCESS_API_LOG_${request.hostname}${
        request.url
      }-${new Date().toISOString()}${request.user ? `-${request.user}` : ""}`,
      JSON.stringify(apiLog)
    );
  }

  next();
});

server.register(require("@fastify/formbody", {}));

// server.register(require('@fastify/url-data'));

bootstrapLoco(server);

server.listen(process.env.PORT || 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
