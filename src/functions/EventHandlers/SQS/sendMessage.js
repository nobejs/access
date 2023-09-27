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
