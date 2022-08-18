const neptune = require("@teurons/neptune-nodejs");

const addUserToNeptune = async (uuid) => {
	let neptuneData = {
		user_id: uuid,
	};
	await neptune.createUser(neptuneData);
};

const prepareUserContactInfoPayload = async (payload) => {
	let neptuneData = {};

	switch (payload.type) {
		case "email":
			neptuneData = {
				type: "email",
				value: payload.value,
				filterable: "regular",
			};
			break;
		case "mobile_number":
			neptuneData = {
				type: "mobile_number",
				value: payload.value,
			};
			break;
		default:
			break;
		// For firebase token
		// let neptuneData = {
		//   type: "firebase_token",
		//   value: "123-456-789",
		//   filterable: "regular",
	}

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
