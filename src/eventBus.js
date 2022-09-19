const neptuneRepo = requireRepo("neptune");
const contextClassRef = requireUtil("contextHelper");
const debugLogger = requireUtil("debugLogger");

const preparePayloadFromVerificationObject = async (eventData) => {
  const verificationObject = eventData.verificationObject;
  const payload = eventData.payload;
  let eventType = null;
  let data = null;
  const eventObject = {
    user_uuid: verificationObject.user_uuid,
    token: verificationObject.token,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
    verification_method: payload.verification_method,
    successRedirect: payload.success_redirect,
    errorRedirect: payload.failure_redirect,
    contact_infos: [
      {
        type: payload.type,
        value: verificationObject.attribute_value,
      },
    ],
  };

  if (eventObject.verification_method == "otp") {
    eventType = `request_otp_to_verify_${payload.type}_during_registration`;
    data = {
      verification_method: payload.verification_method,
      token: eventObject.token,
      type: eventObject.type,
      value: eventObject.value,
    };
  } else if (eventObject.verification_method === "link") {
    eventType = `request_link_to_verify_${eventObject.type}_during_registration`;
    data = {
      verification_method: payload.verification_method,
      link: `${process.env.BASE_URL}/verify-registration-attribute-with-link/${
        eventObject.user_uuid
      }/${eventObject.token}?success_redirect=${encodeURIComponent(
        eventObject.successRedirect
      )}&failure_redirect=${encodeURIComponent(eventObject.errorRedirect)}`,
      type: eventObject.type,
      value: eventObject.value,
    };
  }

  let neptuneData = {
    tags: [],
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  console.log("neptuneData", eventObject);

  await fireEventToExternalEntity(eventType, data, neptuneData);
};

const processUserCreated = async (eventData) => {
  await preparePayloadFromVerificationObject(eventData);
};

const processVerificationRequested = async (eventData) => {
  await preparePayloadFromVerificationObject(eventData);
};

const processUserRegistered = async (eventData) => {
  console.log("processUserRegistered", eventData);

  const verificationObject = eventData.verificationObject;
  const userObject = eventData.userObject;
  const payload = eventData.payload;
  let eventType = null;
  let data = null;

  const eventObject = {
    user_uuid: verificationObject.user_uuid,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
    contact_infos: [
      {
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
      },
    ],
  };

  eventType = `user_registered_using_${verificationObject.attribute_type}`;

  let neptuneData = {
    tags: [],
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  if (process.env.SEND_EVENTS === "neptune") {
    await neptuneRepo.addUserContactInfoToNeptune(eventObject.user_uuid, {
      type: verificationObject.attribute_type,
      value: verificationObject.attribute_value,
      meta: userObject.profile || {},
    });
  }

  await fireEventToExternalEntity(eventType, data, neptuneData);
};

const processUserUpdatedProfile = async (eventData) => {
  console.log("processUserUpdatedProfile", eventData);
  const userObject = eventData.user;

  if (process.env.SEND_EVENTS === "neptune") {
    await neptuneRepo.updateUser(userObject.uuid, {
      meta: userObject.profile || {},
    });
  }
};

const eventBus = async (event, data) => {
  try {
    console.log("eventBus....", event);
    switch (event) {
      case "user_created":
        await processUserCreated(data);
        break;

      case "user_registered":
        await processUserRegistered(data);
        break;

      case "verification_requested":
        await processVerificationRequested(data);
        break;

      case "user_updated_profile":
        await processUserUpdatedProfile(data);
        break;
    }
  } catch (error) {
    console.log("error", error);
  }
};

const fireEventToExternalEntity = async (eventType, data, neptuneData) => {
  if (process.env.SEND_EVENTS === "neptune") {
    await neptuneRepo.fireEvent(eventType, data, neptuneData);
  }
};

module.exports = eventBus;
