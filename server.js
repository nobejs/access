require("./tracing/index");
const Config = require("./config")();
const httpServer = requireHttpServer();
const rabbitSendMessage = requireUtil("rabbitSendMessage");
const contextClassRef = requireUtil("contextHelper");
const bootstrapLoco = require("./loco/bootstrap");
const { trace } = require("@opentelemetry/api");

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

server.register(require("@fastify/formbody", {}));

// server.register(require('@fastify/url-data'));

bootstrapLoco(server);

server.addHook("onSend", function (request, reply, payload, next) {
  if (reply.statusCode === 401 || request.is404 || reply.statusCode === 404) {
    // Handle if condition
  } else {
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
      request_payload: request.body,
      response: payload,
      user_uuid: request.user,
      uuid: request.user,
      meta: {
        id: request.id,
      },
    };

    let activeSpan = trace.getActiveSpan();
    activeSpan.setAttribute("request.user_uuid", request.user);
    activeSpan.setAttribute(
      "request.http_url",
      `${request.protocol}://${request.hostname}${request.url}`
    );
    activeSpan.setAttribute("request.http_status_code", reply.statusCode);
    activeSpan.setAttribute("request.http_method", request.method);
  }

  next();
});

server.listen(process.env.PORT || 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
