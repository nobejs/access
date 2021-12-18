const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (instance) => {
  const attributes = [
    "uuid",
    "team_uuid",
    "user_uuid",
    "role",
    "status",
    "attribute_type",
    "attribute_value",
    "permissions",
    "role_uuid",
  ];
  const memberObject = pickKeysFromObject(instance, attributes);

  return memberObject;
};
