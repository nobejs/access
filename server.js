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
function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
const timestamps = getFormattedTimestamp();

server.addHook("onRequest", async (req, reply) => {
  contextClassRef.client = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
});

server.addHook("onSend", function (request, reply, payload, next) {
  if (process.env.ENABLE_REQUEST_LOGGING === "true") {
    if (reply.statusCode === 401 || request.is404 || reply.statusCode === 404) {
      // Handle if condition
    } else {
      let apiLog = {
        timestamp: getFormattedTimestamp(),
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
        uuid: request.user ? request.user : "",
        meta: {
          id: request.id,
        },
      };

      console.log(
        `${request.hostname}${request.url}-${timestamps}${
          request.user ? `-${request.user}` : ""
        }`,
        JSON.stringify(apiLog, null, 2)
      );
    }
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
