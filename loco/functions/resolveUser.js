const resolveUser = async (locoRoute, frameworkData) => {
  if (locoRoute.resource === "admin-users") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  return "*";
};

module.exports = resolveUser;
