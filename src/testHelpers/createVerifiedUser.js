const usersRepo = requireRepo("users");
const attributesRepo = requireRepo("attributes");

module.exports = async (payload) => {
  try {
    let user = await usersRepo.createUserWithPassword(payload.password);
    await attributesRepo.createAttributeForUUID(user.uuid, payload, true);
    return user;
  } catch (error) {
    throw error;
  }
};
