const postEvent = requireFunction("postEvent");

const registrationVerificationEvent = async (payload) => {
  await postEvent({
    event_type: "auth.registration_verification",
    data: {
      token: payload.token,
      type: payload.type,
      value: payload.value,
    },
  });
};

module.exports = {
  registrationVerificationEvent,
};
