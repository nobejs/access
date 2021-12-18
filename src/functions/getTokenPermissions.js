const TeamsRepo = requireRepo("teams");
const TokensRepo = requireRepo("tokens");

module.exports = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let team = await TeamsRepo.first({ uuid: payload.sub });

      if (team !== undefined) {
        let permissions = await TokensRepo.first({ uuid: payload.jti })
          .permissions;
        resolve(permissions);
      }

      return reject({ message: "Not team member" });
    } catch (error) {
      reject(error);
    }
  });
};
