const single = require("./single");

module.exports = async (tokens) => {
  let result = await Promise.all(
    tokens.map((c) => {
      return single(c);
    })
  );

  return result;
};
