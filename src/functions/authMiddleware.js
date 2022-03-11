const { pathToRegexp } = require("path-to-regexp");
const Config = require("../../config")();
const decodeJWT = requireFunction("JWT/decodeJWT");
const tokensRepo = requireRepo("tokens");
const debugLogger = requireUtil("debugLogger");

// This story check if the Authorization Token is valid:
// Not expired
// Verifiable
// Whitelisted
// It doesn't care about

const exclude = Config["excludeFromAuth"];

module.exports = async (req, reply) => {

  if (req.method === "OPTIONS") {
    reply.header("Content-Type", "text/plain charset=UTF-8");
    reply.header("Content-Length", "0");
    reply.header("Access-Control-Max-Age", "1728000");
    reply.code(204)
    reply.send()
  }

  let needsAuth = true;
  // console.log("req.routerPath", req.method, req.url);

  if (req.routerPath === undefined) {
    return reply.code(404).send({ error: "Not Found" });
  }

  exclude.forEach((p) => {
    let [method, path] = p.split(" ");
    let regex = pathToRegexp(path);
    if (method == req.method && regex.exec(req.routerPath) !== null) {
      needsAuth = false;
    }
  });

  // console.log("needsAuth", needsAuth);

  if (needsAuth) {
    debugLogger("Header", req.headers.authorization);

    if (!req.headers.authorization) {
      debugLogger(
        "Doesn't have authorization header",
        req.headers.authorization
      );
      return reply.code(401).send({ error: "Unauthenticated" });
    }
    const bearer = req.headers.authorization.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;

    try {
      let decoded = await decodeJWT(req.token);
      await tokensRepo.checkIfValidJti(decoded.jti);
      if (!decoded.sub || !decoded.jti || !decoded.iss) {
        debugLogger("Missing one of sub, hti, issuer", decoded);
        return reply.code(401).send({ message: "Unauthenticated" });
      }
      req.decodedJWT = decoded;
      req.sub = decoded.sub;
      req.jti = decoded.jti;
      req.issuer = decoded.iss;
    } catch (error) {
      debugLogger(JSON.stringify(error));
      debugLogger("Something went wrong in middleware", error);
      return reply.code(401).send({ message: "Unauthenticated" });
    }
  }

  //   next();
};
