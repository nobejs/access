const validator = requireValidator();
const sendMessageToOfflineQueue = require("./sendMessageToOfflineQueue");
var uuid = require("uuid");

const validateInput = async (job) => {
  const constraints = {
    type: {
      presence: {
        allowEmpty: false,
        message: "^Please provide type",
      },
    },
  };

  return validator(job, constraints);
};

/* 
  await sendJob({
		type: "compute.user.nudges",
		payload: { user_uuid: userUuid },
	});
*/

const sendJob = async (job) => {
  try {
    console.log("sendJob_____", job);
    await validateInput(job);

    job["job_identifier"] = uuid.v4();

    var params = {
      MessageBody: JSON.stringify(job),
      MessageDeduplicationId: `${job.type}-${Date.now().toString()}`, // Required for FIFO queues
      MessageGroupId: job.type,
    };

    // Insert into jobs table with uuid
    // await offlineJobsRepo.create({
    // 	job_identifier: job.job_identifier,
    // 	job: job,
    // 	status: "pending",
    // });

    await sendMessageToOfflineQueue(params);
  } catch (error) {
    console.log("Error sending job", error);
  }
};

module.exports = { sendJob };
