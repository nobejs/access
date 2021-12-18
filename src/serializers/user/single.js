const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (instance, includes = []) => {
  const attributes = ["uuid", "profile", "created_at", "updated_at"];

  const userObject = pickKeysFromObject(instance, attributes);

  return userObject;
};
