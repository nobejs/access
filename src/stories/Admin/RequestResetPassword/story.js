const validator = requireValidator();
const adminRepo = requireRepo("admin");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
	const payload = findKeysFromRequest(req, ["value"]);
	return payload;
};

const authorize = async ({ prepareResult }) => {
	return true;
};

const validateInput = async (payload) => {
	const constraints = {
		value: {
			presence: {
				allowEmpty: false,
				message: "^Please enter email",
			},
			type: "string",
			custom_callback: {
				message: "User doesn't exist",
				callback: async (payload) => {
					let userCount =
						typeof payload.value === "string"
							? await adminRepo.findUserByValue({
									email: payload.value,
							  })
							: -1;
					return userCount > 0 ? true : false;
				},
			},
		},
	};

	return validator(payload, constraints);
};

const handle = async ({ prepareResult }) => {
	try {
		let inputPayload = prepareResult;
		await validateInput(inputPayload);
		await adminRepo.requestAttributeVerificationForResetPassword(inputPayload);
	} catch (error) {
		throw error;
	}
};

const respond = async ({ handleResult }) => {
	try {
		return handleResult;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	prepare,
	authorize,
	handle,
	respond,
};
