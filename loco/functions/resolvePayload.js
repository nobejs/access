const teamMembersRepo = requireRepo("teamMembers");

const resolvePayload = async (locoRoute, frameworkData) => {
  if (locoRoute.resource === "teams") {
    let invoking_user_uuid = frameworkData.req.sub;

    let currentUserTeams = await teamMembersRepo.findAllWithConstraints({
      user_uuid: invoking_user_uuid,
    });

    currentUserTeams = currentUserTeams.map((m) => {
      return m.team_uuid;
    });

    // console.log("currentUserTeams", currentUserTeams);

    let filterBy = frameworkData.req.body?.filterBy || [];

    let teamFilterByName = filterBy.find((f) => {
      return f.attribute === "name";
    });

    let teamFilterBySlug = filterBy.find((f) => {
      return f.attribute === "slug";
    });

    if (teamFilterByName !== undefined || teamFilterBySlug !== undefined) {
      filterBy.push({ attribute: "uuid", op: "in", value: currentUserTeams });
      frameworkData.req.body["filterBy"] = filterBy;
      return frameworkData.req.body;
    }
  }

  return frameworkData.req.body;
};

module.exports = resolvePayload;
