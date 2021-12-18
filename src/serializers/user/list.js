const single = require("./single");

module.exports = async (environments) => {
  let result = await Promise.all(
    environments.map((c) => {
      return single(c);
    })
  );

  return result;
};
