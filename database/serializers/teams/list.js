const single = require("./single");

module.exports = async (teams) => {
  let result = await Promise.all(
    teams.map((c) => {
      return single(c);
    })
  );

  return result;
};
