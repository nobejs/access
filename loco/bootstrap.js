const { executeRoute, locoFactory } = require("@locospec/engine");
const operator = require("@locospec/operator-knexjs");
const path = require("path");
const Config = require("../config")();
const responseKey = Config["responseKey"];

module.exports = (server) => {
  locoFactory.init({
    locoPath: path.resolve(__dirname),
    operator: operator,
  });

  const routes = locoFactory.generateRoutes();

  routes.forEach((locoRoute) => {
    server[locoRoute.method](locoRoute.path, async (req, res, next) => {
      let result = await executeRoute(locoRoute, {
        req: req,
        reqBody: req.body,
        reqParams: req.params,
        reqQuery: req.query,
        reqHeaders: req.headers,
      });
      return res.code(200).send(result[responseKey]);
    });
  });
};
