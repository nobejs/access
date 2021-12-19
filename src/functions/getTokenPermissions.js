const TeamsRepo = requireRepo("teams");
const TokensRepo = requireRepo("tokens");

module.exports = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let team = await TeamsRepo.findByUuid({ uuid: payload.sub });

      if (team !== undefined) {
        let token = await TokensRepo.first({ uuid: payload.jti });
        resolve(token.permissions);
      }

      return reject({ message: "Not team member" });
    } catch (error) {
      reject(error);
    }
  });
};
