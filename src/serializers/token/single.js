const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (instance, includes = []) => {
  const attributes = ["title", "permissions", "created_at", "updated_at"];
  const tokenObject = pickKeysFromObject(instance, attributes);
  return tokenObject;
};
