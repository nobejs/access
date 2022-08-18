const neptune = require("@teurons/neptune-nodejs");

const addUserToNeptune = async (uuid) => {
	let neptuneData = {
		user_id: uuid,
	};
	await neptune.createUser(neptuneData);
};

const prepareUserContactInfoPayload = async (payload) => {
	let neptuneData = {
		type: payload.type,
		value: payload.value,
	};

	return neptuneData;
};

const addUserContactInfoToNeptune = async (uuid, payload) => {
	let user_id = uuid;
	let neptuneData = await prepareUserContactInfoPayload(payload);

	await neptune.addUserContactInfo(user_id, neptuneData);
};

const updateUserContactInfo = async (uuid, payload) => {
	let user_id = uuid;
	let neptuneData = await prepareUserContactInfoPayload(payload);

	await neptune.updateUserContactInfo(user_id, neptuneData);
};

module.exports = {
	addUserToNeptune,
	addUserContactInfoToNeptune,
	updateUserContactInfo,
};
