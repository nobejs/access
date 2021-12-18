// const RolesRepo = requireRepo("roles");
const TeamMembersRepo = requireRepo("teamMembers");

module.exports = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let teamMember = await TeamMembersRepo.first({
        team_uuid: payload.team_uuid,
        user_uuid: payload.user_uuid,
      });

      if (teamMember !== undefined) {
        // if (teamMember.role !== null) {
        //   let role = await RolesRepo.first({ uuid: teamMember.role });
        //   return resolve(role.permissions);
        // }
        return resolve(teamMember.permissions);
      } else {
        return reject({ message: "Not team member" });
      }

    } catch (error) {
      reject(error);
    }
  });
};
