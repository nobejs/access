const fastify = require("fastify");
const Config = require("../config")();
const errorHandler = Config.load(Config["errorHandler"]);
const notFoundHandler = Config.load(Config["notFoundHandler"]);
const authMiddleware = Config.load(Config["authMiddleware"]);
const loadEndpoints = Config.load(Config["loadEndpoints"]);
const corsMiddleware = Config.load(Config["corsMiddleware"]);
const enableCORS = Config["enableCORS"];
const { globalRateLimit } = requireFunction("rateLimits");

function build(opts = {}) {
  const app = fastify(opts);
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);
  if (enableCORS) {
    app.addHook("onRequest", corsMiddleware);
  }
  // Global rate limit runs after CORS and before auth; app.rateLimit exists only once the plugin loads
  app.register(require("@fastify/rate-limit"), { global: false });
  app.after(() => {
    app.addHook("onRequest", app.rateLimit(globalRateLimit()));
    app.addHook("onRequest", authMiddleware);
    loadEndpoints(app);
  });
  return app;
}

module.exports = build;
