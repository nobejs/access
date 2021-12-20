const contextClassRef = requireUtil("contextHelper");
const usersRepo = requireRepo("users");

module.exports = async () => {
  const { user, token } = await usersRepo.createTestUserWithVerifiedToken({
    type: "email",
    value: "rajiv@betalectic.com",
    password: "GoodPassword",
    purpose: "register",
  });
  contextClassRef.user = user;
  contextClassRef.token = token;
  contextClassRef.headers = {
    Authorization: `Bearer ${contextClassRef.token}`,
  };
};
