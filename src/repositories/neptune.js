const neptune = require("@teurons/neptune-nodejs");
const debugLogger = requireUtil("debugLogger");

const addUserToNeptune = async (uuid) => {
	let neptuneData = {
		user_id: uuid,
	};
	try {
		await neptune.createUser(neptuneData);
	} catch (error) {
		debugLogger(error);
	}
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
	try {
		let neptuneData = await prepareUserContactInfoPayload(payload);
		await neptune.addUserContactInfo(user_id, neptuneData);
	} catch (error) {
		debugLogger(error);
	}
};

const updateUserContactInfo = async (uuid, payload) => {
	let user_id = uuid;
	try {
		let neptuneData = await prepareUserContactInfoPayload(payload);
		await neptune.updateUserContactInfo(user_id, neptuneData);
	} catch (error) {
		debugLogger(error);
	}
};

const deleteUserContactInfo =  async (uuid, payload) => {
	let user_id = uuid;
	try {
		let neptuneData = await prepareUserContactInfoPayload(payload);
		await neptune.deleteUserContactInfo(user_id,{ data:{ neptuneData }});
	} catch (error) {
		debugLogger(error);
	}
}

const fireEvent = async (eventType, data, neptuneData) => {
	try {
		await neptune.fire(eventType, data, neptuneData);
	} catch (error) {
		debugLogger(error);
	}
};

module.exports = {
	addUserToNeptune,
	addUserContactInfoToNeptune,
	updateUserContactInfo,
	fireEvent,
	deleteUserContactInfo,
};
