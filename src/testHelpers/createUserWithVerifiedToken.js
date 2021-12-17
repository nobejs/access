const tokensRepo = requireRepo("tokens");
const createVerifiedUser = testHelper("createVerifiedUser");

module.exports = async (
  payload = {
    type: "email",
    value: "rajiv@betalectic.com",
    password: "GoodPassword",
    purpose: "register",
  }
) => {
  try {
    let user = await createVerifiedUser(payload);
    let token = await tokensRepo.createTokenForUser(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
};
