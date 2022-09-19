const neptune = require("@teurons/neptune-nodejs");
const debugLogger = requireUtil("debugLogger");

const getUserFromNeptune = async (uuid) => {
  try {
    await neptune.getUser(uuid);
  } catch (error) {
    // debugLogger(error);
    throw error;
  }
};

const addUserToNeptune = async (uuid, payload = {}) => {
  let neptuneData = {
    user_id: uuid,
    meta: payload.meta || {},
  };
  try {
    await neptune.createUser(neptuneData);
  } catch (error) {
    debugLogger(error);
    throw error;
  }
};

const updateUser = async (user_uuid, payload = {}) => {
  let neptuneData = {
    user_id: user_uuid,
    meta: payload.meta || {},
  };

  try {
    await getUserFromNeptune(user_uuid);
    await neptune.updateUser(neptuneData);
  } catch (error) {
    try {
      if (error.response.status === 404) {
        await neptune.addUserToNeptune(user_uuid, payload.meta);
        await neptune.updateUser(neptuneData);
      }

      if (error.response.status === 422) {
        return error.response.data;
      }
    } catch (error) {
      debugLogger(error);
      throw error;
    }
  }
};

const prepareUserContactInfoPayload = async (payload) => {
  let neptuneData = {
    type: payload.type,
    value: payload.value,
  };

  return neptuneData;
};

const addUserContactInfoToNeptune = async (user_uuid, payload) => {
  let neptuneData = {
    type: payload.type,
    value: payload.value,
  };

  try {
    await getUserFromNeptune(user_uuid);
    return await neptune.addUserContactInfo(user_uuid, neptuneData);
  } catch (error) {
    try {
      if (error.response.status === 404) {
        await neptune.addUserToNeptune(user_uuid, payload.meta);
        return await neptune.addUserContactInfo(user_uuid, neptuneData);
      }

      if (error.response.status === 422) {
        return error.response.data;
      }
    } catch (error) {
      debugLogger(error);
      throw error;
    }
  }
};

const updateUserContactInfo = async (uuid, payload) => {
  let user_id = uuid;
  try {
    let neptuneData = await prepareUserContactInfoPayload(payload);
    await neptune.updateUserContactInfo(user_id, neptuneData);
  } catch (error) {
    debugLogger(error);
    throw error;
  }
};

const deleteUserContactInfo = async (uuid, payload) => {
  let user_id = uuid;
  try {
    let neptuneData = await prepareUserContactInfoPayload(payload);
    return await neptune.deleteUserContactInfo(user_id, { data: neptuneData });
  } catch (error) {
    if (error.response.status === 422) {
      return error.response.data;
    }

    throw error;
  }
};

const fireEvent = async (eventType, data, neptuneData) => {
  try {
    await neptune.fire(eventType, data, neptuneData);
  } catch (error) {
    debugLogger(error);
    throw error;
  }
};

module.exports = {
  updateUser,
  addUserToNeptune,
  addUserContactInfoToNeptune,
  updateUserContactInfo,
  fireEvent,
  deleteUserContactInfo,
};
