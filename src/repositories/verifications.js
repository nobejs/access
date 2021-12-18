const baseRepo = requireUtil("baseRepo");
const table = "verifications";

const findVerificationForType = async (where = {}, purpose) => {
  let payload = { ...where, ...{ purpose } };
  return await baseRepo.first(table, payload);
};

const findVerificationForRegistration = async (where = {}) => {
  return await findVerificationForType(where, "register");
};

const createVerificationForType = async (data, purpose) => {
  let payload = { ...data, ...{ purpose } };
  return await baseRepo.create(table, payload);
};

const createVerificationForRegistration = async (data) => {
  return await createVerificationForType(data, "register");
};

const updateVerification = async (where, payload) => {
  console.log("where, payload", where, payload)
  return await baseRepo.update(table, where, payload);
};

const removeVerification = async (payload) => {
  return await baseRepo.remove(table, payload, "hard");
};

module.exports = {
  findVerificationForRegistration,
  createVerificationForRegistration,
  updateVerification,
  removeVerification,
};
