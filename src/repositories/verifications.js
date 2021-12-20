const baseRepo = requireUtil("baseRepo");
const table = "verifications";
const generateOTP = requireFunction("generateOTP");
const getMinutesFromNow = requireFunction("getMinutesFromNow");

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const findVerificationForType = async (where = {}, purpose) => {
  let payload = { ...where, ...{ purpose } };
  return await baseRepo.first(table, payload);
};

const findVerificationForRegistration = async (where = {}) => {
  return await findVerificationForType(where, "register");
};

const findVerificationForResetPassword = async (where = {}) => {
  return await findVerificationForType(where, "reset-password");
};

const createVerificationForType = async (data, purpose) => {
  let payload = { ...data, ...{ purpose } };
  payload["token"] = generateOTP();
  payload["expires_at"] = getMinutesFromNow(10);
  return await baseRepo.create(table, payload);
};

const createVerificationForRegistration = async (data) => {
  let response = await createVerificationForType(data, "register");
  return response;
};

const createVerificationForResetPassword = async (data) => {
  let response = await createVerificationForType(data, "reset-password");
  return response;
};

const updateVerification = async (where, payload = {}) => {
  payload["token"] = generateOTP();
  payload["expires_at"] = getMinutesFromNow(10);
  return await baseRepo.update(table, where, payload);
};

const removeVerification = async (payload) => {
  return await baseRepo.remove(table, payload, "hard");
};

module.exports = {
  findVerificationForRegistration,
  createVerificationForRegistration,
  findVerificationForResetPassword,
  createVerificationForResetPassword,
  updateVerification,
  removeVerification,
  countAll,
};
