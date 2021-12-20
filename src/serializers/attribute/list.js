const single = require("./single");

module.exports = async (objects) => {
  let result = await Promise.all(
    objects.map((c) => {
      return single(c);
    })
  );

  return result;
};
