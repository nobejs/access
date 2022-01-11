const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports = async (payload) => {
  let timestamp = Math.floor(new Date().getTime() / 1000);

  payload = Object.assign(
    {
      version: 1,
      message_id: `access-${uuidv4()}-${timestamp}`,
      timestamp,
    },
    payload
  );

  // console.log("process.env", process.env);

  if (process.env.NODE_ENV !== "test") {
    return await axios.post(
      "https://webhook.site/a479feff-7497-48cf-851c-1dc66c4644f3",
      payload
    );
  }
};
