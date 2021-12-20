const contextClassRef = requireUtil("contextHelper");
const usersRepo = requireRepo("users");

module.exports = async () => {
  let userPayload = {
    type: "email",
    value: "rajiv@betalectic.com",
    password: "GoodPassword",
    purpose: "register",
  };
  const { user, token } = await usersRepo.createTestUserWithVerifiedToken(
    userPayload
  );
  contextClassRef.userPayload = userPayload;
  contextClassRef.user = user;
  contextClassRef.token = token;
  contextClassRef.headers = {
    Authorization: `Bearer ${contextClassRef.token}`,
  };
};
