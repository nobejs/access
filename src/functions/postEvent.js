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

  if (process.env.NODE_ENV === "test") {
    return false;
  }

  console.log("process.env", process.env);

  if (
    process.env.POST_TO_WEBHOOK !== "" &&
    process.env.POST_TO_WEBHOOK !== undefined
  ) {
    return await axios.post(process.env.POST_TO_WEBHOOK, payload);
  }

  if (process.env.NEPTUNE_ENV !== "" && process.env.NEPTUNE_ENV !== undefined) {
    let eventsEndpoints = `https://edge.teurons.com/neptune/events/ingest`;

    // console.log("eventsEndpoints", process.env.NEPTUNE_TOKEN);
    payload["api_token"] = process.env.NEPTUNE_TOKEN;
    payload["environment"] = process.env.NEPTUNE_ENV;

    try {
      let result = await axios.post(eventsEndpoints, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEPTUNE_TOKEN}`,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }
};
