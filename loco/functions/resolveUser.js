const knex = requireKnex();
const teamMembersRepo = requireRepo("teamMembers");

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

  if (locoRoute.resource === "admin-admins") {
    if (frameworkData.req.issuer === "admin") {
      return "*";
    } else {
      return [];
    }
  }

  if (locoRoute.resource === "teams") {
    console.log("Framework,", frameworkData.req);

    let invoking_user_uuid = frameworkData.req.sub;

    let currentUserTeams = await teamMembersRepo.findAllWithConstraints({
      user_uuid: invoking_user_uuid,
    });

    currentUserTeams = currentUserTeams.map((m) => {
      return m.team_uuid;
    });

    let filterBy = frameworkData.reqBody?.filterBy || [];
    let teamFilterByUuid = filterBy.find((f) => {
      return f.attribute === "uuid";
    });

    if (
      teamFilterByUuid !== undefined &&
      currentUserTeams.includes(teamFilterByUuid.value)
    ) {
      return "*";
    }

    let teamFilterByName = filterBy.find((f) => {
      return f.attribute === "name";
    });

    let teamFilterBySlug = filterBy.find((f) => {
      return f.attribute === "slug";
    });

    if (teamFilterByName !== undefined || teamFilterBySlug !== undefined) {
      return "*";
    }
  }

  return [];
};

module.exports = resolveUser;
