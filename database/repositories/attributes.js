const baseRepo = requireUtil("baseRepo");
const table = "attributes";

const countAll = async (where = {}, whereNot = {}) => {
  return await baseRepo.countAll(table, where, whereNot);
};

const create = async (payload) => {
  return await baseRepo.create(table, payload);
};

const first = async (payload) => {
  return await baseRepo.first(table, payload);
};

const createAttributeForUUID = async (uuid, payload, verify = false) => {
  await baseRepo.create(table, {
    user_uuid: uuid,
    verified_at: verify ? new Date().toISOString() : NULL,
    type: payload.type,
    value: payload.value,
    purpose: payload.purpose,
  });
};

module.exports = {
  create,
  first,
  countAll,
  createAttributeForUUID,
};
