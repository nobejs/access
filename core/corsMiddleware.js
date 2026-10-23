module.exports = (request, reply, next) => {
  try {
    if (request.headers.origin) {
      let allowOrigin = true;

      if (process.env.CORS_RESTRICT_ORIGINS === "true") {
        allowOrigin = false;
        try {
          const hostname = new URL(request.headers.origin).hostname;
          allowOrigin = (process.env.CORS_ALLOWED_ORIGINS || "")
            .split(",")
            .map((domain) => domain.trim())
            .some(
              (domain) =>
                domain &&
                (hostname === domain || hostname.endsWith("." + domain)),
            );
        } catch (e) {}
      }

      if (allowOrigin) {
        reply.header("Access-Control-Allow-Origin", request.headers.origin);
        reply.header("Vary", "Origin");
      }
    }

    reply.header(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, DELETE, PATCH, OPTIONS"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Client-Identifier,X-Team-Identifier"
    );
    reply.header("Access-Control-Allow-Credentials", "true");

    if (request.method === "OPTIONS") {
      reply.header("Content-Type", "text/plain charset=UTF-8");
      reply.header("Content-Length", "0");
      reply.header("Access-Control-Max-Age", "1728000");
      reply.code(204);
      reply.send();
    } else {
      next();
    }
  } catch (e) {
    throw e;
  }
};
