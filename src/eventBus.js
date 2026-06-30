const contextClassRef = requireUtil("contextHelper");
const { sendJob } = requireFunction("EventHandlers/SQS/fireEventToPushToSqs");

const preparePayloadFromVerificationObject = async (
  eventType,
  verifyViaLinkRoute,
  eventData,
  urlLink = null
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

    if (urlLink !== null) {
      data.link = urlLink;
    }
  }

  let eventMeta = {
    tags: [],
    ignore_user_contacts: "true",
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
};

const processUserCreated = async (eventData) => {
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

const processUserCreatedByAdmin = async (eventData) => {
  const payload = eventData.payload;
  const user = eventData.user;
  let eventType = null;
  eventType = "user_created_by_admin";

  const eventObject = {
    user_uuid: user.uuid,
    type: payload.type,
    password: payload.password,
    value: payload.value,
    contact_infos: [
      {
        type: payload.type,
        value: payload.value,
      },
    ],
  };

  let eventMeta = {
    tags: [],
    ignore_user_contacts: "true",
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  let data = {
    user_id: eventObject.user_uuid,
    type: eventObject.type,
    value: eventObject.value,
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
};

const processUserAddedToTeamByAdmin = async (eventData) => {
  const member = eventData.member;
  const attributes = eventData.attributes;
  let eventType = null;
  eventType = "user_added_to_team_by_admin";

  let contact_infos = attributes.map((a) => {
    return {
      type: a.type,
      value: a.value,
    };
  });

  const eventObject = {
    user_uuid: member.user_uuid,
    contact_infos: contact_infos,
  };

  let eventMeta = {
    tags: [],
    ignore_user_contacts: "true",
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  let data = {
    member: member,
    team: member.team,
    user: member.user,
    attributes: attributes,
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
};

const processInvitedToTeam = async (eventData) => {
  const payload = eventData.payload;
  const eventType = "invited_to_team";

  let data = {
    team_uuid: payload.team_uuid,
    team_name: payload.team_name,
    type: payload.type,
    value: payload.value,
  };

  let eventMeta = {
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
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

  let eventMeta = {
    tags: [],
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  data = {
    user_uuid: verificationObject.user_uuid,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
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

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istDate = new Date(now.getTime() + istOffset);

  const formattedTime = `${String(istDate.getUTCHours()).padStart(
    2,
    "0"
  )}:${String(istDate.getUTCMinutes()).padStart(2, "0")}, ${String(
    istDate.getUTCDate()
  ).padStart(2, "0")}/${String(istDate.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}/${istDate.getUTCFullYear()}`;

  let data = {
    token: eventObject.token,
    type: eventObject.type,
    value: eventObject.value,
    time: formattedTime,
  };

  let eventMeta = {
    tags: [],
    user_id: eventObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: eventObject.contact_infos || [],
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
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

  let urlLink = `${payload.prefix_url}?user_uuid=${verificationObject.user_uuid}&token=${verificationObject.token}`;

  await preparePayloadFromVerificationObject(
    eventType,
    verifyViaLinkRoute,
    eventData,
    urlLink
  );
};

const processSetPasswordForNewUser = async (eventData) => {
  const verificationObject = eventData.verification;
  const payload = eventData.payload;
  let eventType = "admin_request_user_to_set_password";

  let data = {
    user_id: verificationObject.user_uuid,
    token: verificationObject.token,
    type: verificationObject.attribute_type,
    value: verificationObject.attribute_value,
    prefixUrl: payload.prefixUrl,
  };

  let eventMeta = {
    tags: [],
    user_id: verificationObject.user_uuid,
    client: contextClassRef.client,
    contact_infos: [
      {
        type: verificationObject.attribute_type,
        value: verificationObject.attribute_value,
      },
    ],
  };

  await fireEventToExternalEntity(eventType, data, eventMeta);
};

const eventBus = async (event, data) => {
  try {
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

      case "user_requested_login_otp":
        await processUserRequestLoginOTP(data);
        break;

      case "user_requested_reset_password":
        await processUserRequestedResetPassword(data);
        break;

      case "user_created_by_admin":
        await processUserCreatedByAdmin(data);
        break;

      case "user_added_to_team_by_admin":
        await processUserAddedToTeamByAdmin(data);
        break;

      case "admin_request_user_to_set_password":
        await processSetPasswordForNewUser(data);
        break;

      case "invited_to_team":
        await processInvitedToTeam(data);
        break;
    }
  } catch (error) {
    console.log("error", error);
  }
};

const fireEventToExternalEntity = async (eventType, data, eventMeta) => {
  const sqsPayload = {
    data,
    service_tenant: process.env.SERVICE_TENANT,
    type: eventType,
    contact_infos: eventMeta.contact_infos || [],
    environment: process.env.ENVIRONMENT,
    user_id: eventMeta.user_id || null,
  };

  await sendJob(sqsPayload);
};

module.exports = eventBus;
