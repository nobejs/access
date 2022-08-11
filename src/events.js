const postEvent = requireFunction("postEvent");
const contextClassRef = requireUtil("contextHelper");
const neptune = require("@teurons/neptune-nodejs");

const registrationVerificationEvent = async (payload) => {
  // console.log("contextClassRef", contextClassRef.client);
   let eventType = null;
   let data = null;
if(payload.verification_method == 'otp'){
   eventType = `request_otp_to_verify_${payload.type}_during_registration`;
   data = {
    token: payload.token,
    type: payload.type,
    value: payload.value,
  };
}else if(payload.verification_method === 'link'){
   eventType = `request_link_to_verify_${payload.type}_during_registration`;
   data = {
    link: `${process.env.BASE_URL}/verify-attribute-with-link/${payload.user_uuid}/${payload.token}`,
    type: payload.type,
    value: payload.value,
  };
}

  let neptuneData = {
    tags: [],
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  };

  await neptune.fire(eventType, data, neptuneData);
};

const updateVerificationEvent = async (payload) => {
  // console.log("contextClassRef", contextClassRef.client);

  let eventType = `request_otp_to_verify_${payload.type}_during_update`;
  let data = {
    token: payload.token,
    type: payload.type,
    value: payload.value,
    purpose: payload.purpose,
  };

  let neptuneData = {
    tags: [],
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  };

  await neptune.fire(eventType, data, neptuneData);
};

const resetPasswordVerificationEvent = async (payload) => {
  let eventType = `request_otp_to_reset_password_through_${payload.type}`;
  let data = {
    token: payload.token,
    type: payload.type,
    value: payload.value,
  };
  let neptuneData = {
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  };

  await neptune.fire(eventType, data, neptuneData);
};

const loginWithOtpEvent = async (payload) => {
  let eventType = `request_otp_to_login_through_${payload.type}`;
  let data = {
    token: payload.token,
    type: payload.type,
    value: payload.value,
  };

  let neptuneData = {
    tags: [],
    user_id: payload.user_uuid,
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  };

  await neptune.fire(eventType, data, neptuneData);
};

const invitedToTeamEvent = async (payload) => {
  let eventType = `invited_to_team`;
  let data = {
    team_uuid: payload.team_uuid,
    team_name: payload.team_name,
    type: payload.type,
    value: payload.value,
  };

  let neptuneData = {
    client: contextClassRef.client,
    contact_infos: payload.contact_infos || [],
  };

  await neptune.fire(eventType, data, neptuneData);
};

module.exports = {
  registrationVerificationEvent,
  resetPasswordVerificationEvent,
  updateVerificationEvent,
  invitedToTeamEvent,
  loginWithOtpEvent,
};
