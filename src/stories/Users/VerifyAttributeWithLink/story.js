const usersRepo = requireRepo("users");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
	const payload = reqParams;
	console.log(payload);
	return payload;
};

const authorize = async ({ prepareResult }) => {
	try {
		if (0) {
			throw {
				statusCode: 401,
				message: "Unauthorized",
			};
		}

		return true;
	} catch (error) {
		throw error;
	}
};

const handle = async ({ prepareResult, authorizeResult }) => {
	try {
		return await usersRepo.verifyAttributesWithLink(prepareResult);
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
