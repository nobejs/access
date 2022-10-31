const resolveUser = async (locoRoute, frameworkData) => {
  if (locoRoute.resource === "admin-users") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  if (locoRoute.resource === "admin-attributes") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  if (locoRoute.resource === "admin-teams") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  if (locoRoute.resource === "admin-team-members") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  return "*";
};

module.exports = resolveUser;
