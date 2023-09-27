var AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.SQS_AWS_REGION,
  accessKeyId: process.env.SQS_AWS_ACCESS_KEY,
  secretAccessKey: process.env.SQS_AWS_SECRET_ACCESS_KEY,
});

module.exports = async (queueUrl, params) => {
  var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

  console.log("queueUrl", queueUrl);

  params["QueueUrl"] = queueUrl;

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.MessageId);
      }
    });
  });
};

// Send messsage to queue
// var params = {
//   MessageBody: JSON.stringify({
//     event_name: "ORDER_CREATED_2_4",
//     tenant: "prueba",
//     time: Date.now(),
//     data: {
//       id: 1,
//       investor_id: 123,
//       fund_scheme: "ILFS",
//       units: 10,
//       status: "SUCCESS",
//     },
//   }),
//   MessageDeduplicationId: Date.now().toString(), // Required for FIFO queues
//   MessageGroupId: "Group-1", // Required for FIFO queues
//   QueueUrl:
//     "https://sqs.ap-south-1.amazonaws.com/473674611069/fp-cybrilla-sandbox-events-consumer.fifo",
// };
