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
      "https://webhook.site/c163ea5d-07b8-469f-bb05-d9f650a3803d",
      payload
    );
  }
};
