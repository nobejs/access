const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (instance, includes = []) => {
  const attributes = ["type", "value", "purpose"];
  const instanceObject = pickKeysFromObject(instance, attributes);
  return instanceObject;
};
