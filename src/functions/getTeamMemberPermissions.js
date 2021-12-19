// const RolesRepo = requireRepo("roles");
const teamMembersRepo = requireRepo("teamMembers");

module.exports = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let teamMember = await teamMembersRepo.findWithConstraints({
        team_uuid: payload.team_uuid,
        user_uuid: payload.user_uuid,
        status: "accepted",
      });

      if (teamMember !== undefined) {
        // if (teamMember.role !== null) {
        //   let role = await RolesRepo.first({ uuid: teamMember.role });
        //   return resolve(role.permissions);
        // }
        return resolve(teamMember.permissions);
      } else {
        return reject({ statusCode: 403, message: "Forbidden" });
      }
    } catch (error) {
      reject({ statusCode: 404, message: "Not Found" });
    }
  });
};
