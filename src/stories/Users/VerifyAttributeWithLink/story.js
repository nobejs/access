const usersRepo = requireRepo("users");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
	const payload = findKeysFromRequest(req, [
		"user_uuid",
		"verification_code",
		"success_redirect",
		"failure_redirect",
	]);
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

const respond = async ({ prepareResult, handleResult, res }) => {
	try {
		if (prepareResult.success_redirect && prepareResult.failure_redirect) {
			if (handleResult.success) {
				res.redirect(prepareResult.success_redirect);
			} else {
				res.redirect(prepareResult.failure_redirect);
			}
		} else {
			return handleResult.success;
		}
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
