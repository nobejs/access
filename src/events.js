const postEvent = requireFunction("postEvent");

const registrationVerificationEvent = async (payload) => {
  await postEvent({
    event_type: `request_otp_to_verify_${payload.type}_during_registration`,
    tags: [],
    user_id: payload.user_uuid,
    data: {
      token: payload.token,
      type: payload.type,
      value: payload.value,
    },
  });
};

const resetPasswordVerificationEvent = async (payload) => {
  await postEvent({
    event_type: "auth.reset_password_verification",
    data: {
      token: payload.token,
      type: payload.type,
      value: payload.value,
    },
  });
};

module.exports = {
  registrationVerificationEvent,
  resetPasswordVerificationEvent,
};
