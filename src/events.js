const postEvent = requireFunction("postEvent");
const contextClassRef = requireUtil("contextHelper");
const neptune = require("@teurons/neptune-nodejs");

const registrationVerificationEvent = async (payload) => {
  // console.log("contextClassRef", contextClassRef.client);

  let eventType = `request_otp_to_verify_${payload.type}_during_registration`;
  let data = {
    token: payload.token,
    type: payload.type,
    value: payload.value,
  };

  await neptune.fire(eventType, data, {
    tags: [],
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  });
};

const resetPasswordVerificationEvent = async (payload) => {
  await postEvent({
    event_type: `request_otp_to_reset_password_through_${payload.type}`,
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    data: {
      token: payload.token,
      type: payload.type,
      value: payload.value,
    },
    contact_infos: payload.contact_infos || [],
  });
};

const loginWithOtpEvent = async (payload) => {
  await postEvent({
    event_type: `request_otp_to_login_through_${payload.type}`,
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    data: {
      token: payload.token,
      type: payload.type,
      value: payload.value,
    },
    contact_infos: payload.contact_infos || [],
  });
};

const invitedToTeamEvent = async (payload) => {
  await postEvent({
    event_type: `invited_to_team`,
    client: contextClassRef.client,
    data: {
      team_uuid: payload.team_uuid,
      team_name: payload.team_name,
      type: payload.type,
      value: payload.value,
    },
    contact_infos: payload.contact_infos || [],
  });
};

module.exports = {
  registrationVerificationEvent,
  resetPasswordVerificationEvent,
  invitedToTeamEvent,
  loginWithOtpEvent,
};
