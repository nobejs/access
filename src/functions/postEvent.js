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

  if (
    process.env.POST_TO_WEBHOOK !== "" &&
    process.env.POST_TO_WEBHOOK !== undefined
  ) {
    return await axios.post(process.env.POST_TO_WEBHOOK, payload);
  }

  if (process.env.NEPTUNE_ENV !== "" && process.env.NEPTUNE_ENV !== undefined) {
    let eventsEndpoints = `${process.env.NEPTUNE_ENDPOINT}/${process.env.NEPTUNE_ENV}/events`;

    // console.log("eventsEndpoints", process.env.NEPTUNE_TOKEN);

    try {
      let result = await axios.post(eventsEndpoints, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEPTUNE_TOKEN}`,
        },
      });
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
  }
};
