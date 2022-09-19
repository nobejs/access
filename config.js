if (process.env.ENVFILE) {
  var dotenv = require("dotenv");
  dotenv.config({ path: process.env.ENVFILE });
}

const executeStrategy = require("./core/executeStrategy");

global.queueJobStrategy = executeStrategy([
  "prepare",
  "*augmentPrepare",
  "authorize",
  "handle",
]);

global.endpointStrategy = executeStrategy([
  "prepare",
  "*augmentPrepare",
  "authorize",
  "handle",
  "respond",
]);

global.testStrategy = executeStrategy([
  "*augmentPrepare",
  "authorize",
  "handle",
  "respond",
]);

global.requireStory = (name) => require(`./src/stories/${name}/story.js`);
global.requireUtil = (name) => require(`./core/utils/${name}`);
global.requireRepo = (name) => require(`./src/repositories/${name}`);
global.requireHelper = (name) => require(`./src/helpers/${name}`);
global.requireSerializer = (name) => require(`./src/serializers/${name}`);
global.requireValidator = () => require(`./core/validator`);
global.requireHttpServer = () => require(`./core/httpServer`);
global.requireGlobal = () => require(`./global.js`);
global.requireKnex = () => require(`./database/knex.js`);

global.requireTestFunction = (name) => require(`./src/functions/tests/${name}`);
global.testHelper = (name) => require(`./src/testHelpers/${name}`);
global.requireFunction = (name) => require(`./src/functions/${name}`);

module.exports = () => {
  return {
    load: (file) => {
      return require(file);
    },
    httpServer: "./core/httpServer",
    errorHandler: "./core/errorHandler",
    notFoundHandler: "./core/notFoundHandler",
    authMiddleware: "./src/functions/authMiddleware",
    corsMiddleware: "./core/corsMiddleware",
    loadEndpoints: "./core/loadEndpoints",
    validator: "./core/validator",
    endpoints: "./src/endpoints",
    excludeFromAuth: [
      "GET /health",
      "POST /readiness",
      "POST /register",
      "POST /login",
      "POST /login/otp/initiate",
      "POST /login/otp",
      "POST /login/google",
      "GET /login/google",
      "POST /verify-registration",
      "POST /request-verify-registration",
      "POST /request-reset-password",
      "POST /reset-password",
      "POST /login/apple",
      "POST /login/apple-redirection-url",
      // "GET /login/apple",
      "POST /login/linkedin",
      "GET /login/linkedin",
      "POST /login/facebook",
      "GET /login/facebook",
      "GET /verify-attribute-with-link/:user_uuid/:verification_code",
      "POST /admin/login",
      "POST /admin/request-reset-password",
      "POST /admin/reset-password",
    ],
    responseKey: "respondResult",
    enableCORS: true,
  };
};
