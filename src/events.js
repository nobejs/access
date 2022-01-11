const postEvent = requireFunction("postEvent");
const contextClassRef = requireUtil("contextHelper");

const registrationVerificationEvent = async (payload) => {
  console.log("contextClassRef", contextClassRef.client);

  await postEvent({
    event_type: `request_otp_to_verify_${payload.type}_during_registration`,
    tags: [],
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
};
