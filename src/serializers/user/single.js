const pickKeysFromObject = requireUtil("pickKeysFromObject");
const attributesRepo = requireRepo("attributes");
const attributesSerializer = requireSerializer("attribute");

module.exports = async (instance, includes = []) => {
  const attributes = ["uuid", "profile", "created_at", "updated_at"];

  const userObject = pickKeysFromObject(instance, attributes);
  let userAttributes = await attributesRepo.getAttributesForUUID(
    userObject.uuid
  );

  userAttributes = await attributesSerializer.list(userAttributes);
  userObject["attributes"] = userAttributes;

  return userObject;
};
