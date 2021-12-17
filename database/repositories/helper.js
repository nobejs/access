module.exports = {
  addCreatedTimestamps: (payload) => {
    payload["created_at"] = new Date().toISOString();
    payload["updated_at"] = new Date().toISOString();
    return payload;
  },
};
