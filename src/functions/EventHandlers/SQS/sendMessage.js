const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({
  region: process.env.SQS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.SQS_AWS_ACCESS_KEY,
    secretAccessKey: process.env.SQS_AWS_SECRET_ACCESS_KEY,
  },
  apiVersion: "2012-11-05",
});

module.exports = async (queueUrl, params) => {
  try {
    console.log("queueUrl", queueUrl);

    params["QueueUrl"] = queueUrl;

    const command = new SendMessageCommand(params);
    const result = await sqsClient.send(command);
    return result.MessageId;
  } catch (error) {
    console.log("Error sending message", error);
    throw error;
  }
};
