const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClientConfig = {
  region: process.env.SQS_AWS_REGION || process.env.AWS_REGION,
  apiVersion: "2012-11-05",
};

const accessKeyId = process.env.SQS_AWS_ACCESS_KEY;
const secretAccessKey = process.env.SQS_AWS_SECRET_ACCESS_KEY;

if (accessKeyId && secretAccessKey) {
  sqsClientConfig.credentials = { accessKeyId, secretAccessKey };
}

const sqsClient = new SQSClient(sqsClientConfig);

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
