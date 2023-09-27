const sendMessage = require("./sendMessage");

module.exports = async (params) => {
  return await sendMessage(process.env.SQS_AWS_OFFLINE_QUEUE, params);
};
