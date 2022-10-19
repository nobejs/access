const resolveUser = async (locoRoute, frameworkData) => {
  if (locoRoute.resource === "users" && locoRoute.action === "read") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  return "*";
};

module.exports = resolveUser;
