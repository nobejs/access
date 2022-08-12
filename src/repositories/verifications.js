const baseRepo = requireUtil("baseRepo");
const table = "verifications";
const generateOTP = requireFunction("generateOTP");
const getMinutesFromNow = requireFunction("getMinutesFromNow");

const countAll = async (where = {}, whereNot = {}) => {
	return await baseRepo.countAll(table, where, whereNot);
};

const findAll = async (where = {}, columns = ["*"]) => {
	return await baseRepo.findAll(table, where, columns);
};

const findVerificationForType = async (where = {}, purpose) => {
	let payload = { ...where, ...{ purpose } };
	return await baseRepo.first(table, payload);
};

const findVerificationForUpdate = async (where = {}) => {
	return await findVerificationForType(where, "update");
};

const findVerificationForRegistration = async (where = {}) => {
	return await findVerificationForType(where, "register");
};

const findVerificationForResetPassword = async (where = {}) => {
	return await findVerificationForType(where, "reset-password");
};

const createVerificationForType = async (data, purpose) => {
	let tokenExpiry = process.env.TOKEN_EXPIRY_TIME
		? process.env.TOKEN_EXPIRY_TIME
		: 10;
	let payload = { ...data, ...{ purpose } };
	payload["token"] = generateOTP();
	payload["expires_at"] = getMinutesFromNow(tokenExpiry);
	return await baseRepo.create(table, payload);
};

const createVerificationForRegistration = async (data) => {
	let response = await createVerificationForType(data, "register");
	return response;
};

const findVerificationForLogin = async (where = {}) => {
	return await findVerificationForType(where, "login");
};

const createVerificationForLogin = async (data) => {
	let response = await createVerificationForType(data, "login");
	return response;
};

const createVerificationForResetPassword = async (data) => {
	let response = await createVerificationForType(data, "reset-password");
	return response;
};

const createVerificationForUpdate = async (data) => {
	let response = await createVerificationForType(data, "update");
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
	findVerificationForLogin,
	createVerificationForLogin,
	findVerificationForUpdate,
	createVerificationForUpdate,
	updateVerification,
	removeVerification,
	countAll,
	findAll,
};
