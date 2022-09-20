const neptuneRepo = requireRepo("neptune");
const contextClassRef = requireUtil("contextHelper");
const debugLogger = requireUtil("debugLogger");

const preparePayloadFromVerificationObject = async (
  eventType,
  verifyViaLinkRoute,
  eventData
) => {
  const verificationObject = eventData.verificationObject;
  const payload = eventData.payload;
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
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
      },
    ],
  };

  if (eventObject.verification_method == "otp") {
    data = {
      verification_method: payload.verification_method,
      token: eventObject.token,
      type: eventObject.type,
      value: eventObject.value,
      purpose: payload.purpose,
    };
  } else if (eventObject.verification_method === "link") {
    data = {
      verification_method: payload.verification_method,
      link: `${process.env.BASE_URL}/${verifyViaLinkRoute}/${
        eventObject.user_uuid
      }/${eventObject.token}?success_redirect=${encodeURIComponent(
        eventObject.successRedirect
      )}&failure_redirect=${encodeURIComponent(eventObject.errorRedirect)}`,
      type: eventObject.type,
      value: eventObject.value,
      purpose: payload.purpose,
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
  const payload = eventData.payload;
  const verification_method = payload.verification_method;
  let eventType = null;
  let verifyViaLinkRoute = "verify-registration-attribute-with-link";

  if (verification_method == "otp") {
    eventType = `request_otp_to_verify_${payload.type}_during_registration`;
  } else if (verification_method === "link") {
    eventType = `request_link_to_verify_${eventObject.type}_during_registration`;
  }

  await preparePayloadFromVerificationObject(
    eventType,
    verifyViaLinkRoute,
    eventData
  );
};

const processVerificationRequestedDuringRegistration = async (eventData) => {
  const payload = eventData.payload;
  const verification_method = payload.verification_method;
  let eventType = null;
  let verifyViaLinkRoute = "verify-registration-attribute-with-link";

  if (verification_method == "otp") {
    eventType = `request_otp_to_verify_${payload.type}_during_registration`;
  } else if (verification_method === "link") {
    eventType = `request_link_to_verify_${payload.type}_during_registration`;
  }

  await preparePayloadFromVerificationObject(
    eventType,
    verifyViaLinkRoute,
    eventData
  );
};

const processVerificationRequestedDuringUpdate = async (eventData) => {
  const payload = eventData.payload;
  const verification_method = payload.verification_method;
  let eventType = null;
  let verifyViaLinkRoute = "verify-registration-attribute-with-link";

  // if (verification_method == "otp") {
  //   eventType = `request_otp_to_verify_${payload.type}_during_registration`;
  // } else if (verification_method === "link") {
  //   eventType = `request_link_to_verify_${eventObject.type}_during_registration`;
  // }

  eventType = `request_otp_to_verify_${payload.type}_during_update`;

  await preparePayloadFromVerificationObject(
    eventType,
    verifyViaLinkRoute,
    eventData
  );
};

const processUserRegistered = async (eventData) => {
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
  const userObject = eventData.user;

  if (process.env.SEND_EVENTS === "neptune") {
    await neptuneRepo.updateUser(userObject.uuid, {
      meta: userObject.profile || {},
    });
  }
};

const processUserUpdatedExistingAttribute = async (eventData) => {
  const { attributeObject, existingAttribute } = eventData;
  let deleteResult = await neptuneRepo.deleteUserContactInfo(
    existingAttribute.user_uuid,
    {
      type: existingAttribute.type,
      value: existingAttribute.value,
      purpose: existingAttribute.purpose,
    }
  );

  let addResult = await neptuneRepo.addUserContactInfoToNeptune(
    attributeObject.user_uuid,
    {
      type: attributeObject.type,
      value: attributeObject.value,
      purpose: attributeObject.purpose,
    }
  );
};

const processUserAddedNewAttribute = async (eventData) => {
  const { attributeObject } = eventData;

  let addResult = await neptuneRepo.addUserContactInfoToNeptune(
    attributeObject.user_uuid,
    {
      type: attributeObject.type,
      value: attributeObject.value,
      purpose: attributeObject.purpose,
    }
  );
};

const processUserRequestLoginOTP = async (eventData) => {
  const verificationObject = eventData.verificationObject;

  let eventType = `request_otp_to_login_through_${verificationObject.attribute_type}`;
  const eventObject = {
    user_uuid: verificationObject.user_uuid,
    token: verificationObject.token,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
    contact_infos: [
      {
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
      },
    ],
  };

  let data = {
    token: eventObject.token,
    type: eventObject.type,
    value: eventObject.value,
  };

  let neptuneData = {
    tags: [],
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  await fireEventToExternalEntity(eventType, data, neptuneData);
};

const processUserRequestedResetPassword = async (eventData) => {
  const verificationObject = eventData.verificationObject;
  const payload = eventData.payload;
  const verification_method = payload.verification_method;
  let eventType = null;
  let verifyViaLinkRoute = "reset-password-with-link";

  if (verification_method == "otp") {
    eventType = `request_otp_to_reset_password_through_${verificationObject.attribute_type}`;
  } else if (verification_method === "link") {
    eventType = `request_link_to_reset_password_through_${verificationObject.attribute_type}`;
  }

  await preparePayloadFromVerificationObject(
    eventType,
    verifyViaLinkRoute,
    eventData
  );
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

      case "verification_requested_during_registration":
        await processVerificationRequestedDuringRegistration(data);
        break;

      case "verification_requested_during_update":
        await processVerificationRequestedDuringUpdate(data);
        break;

      case "user_updated_existing_attribute":
        await processUserUpdatedExistingAttribute(data);
        break;

      case "user_added_new_attribute":
        await processUserAddedNewAttribute(data);
        break;

      case "user_updated_profile":
        await processUserUpdatedProfile(data);
        break;

      case "user_requested_login_otp":
        await processUserRequestLoginOTP(data);
        break;

      case "user_requested_reset_password":
        await processUserRequestedResetPassword(data);
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
