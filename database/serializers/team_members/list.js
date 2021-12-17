const single = require("./single");

module.exports = async (members) => {
  let result = await Promise.all(
    members.map((c) => {
      return single(c);
    })
  );

  return result;
};
