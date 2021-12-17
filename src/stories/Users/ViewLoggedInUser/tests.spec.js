const debugLogger = requireUtil("debugLogger");
const createVerifiedUser = testHelper("createVerifiedUser");
const tokensRepo = requireRepo("tokens");
const decodeJWT = requireFunction("JWT/decodeJWT");

describe("Test Handler Users/ViewLoggedInUser", () => {
  it("logged_in_user_can_fetch_user_object", async () => {
    let result = {};
    try {
      // Create user
      let user = await createVerifiedUser({
        type: "email",
        value: "rajiv@betalectic.com",
        password: "GoodPassword",
        purpose: "register",
      });

      let token = await tokensRepo.createTokenForUser(user);

      let decoded = await decodeJWT(token);

      result = await testStrategy("Users/ViewLoggedInUser", {
        prepareResult: {
          jti: decoded.jti,
        },
      });
      const { respondResult } = result;

      expect(respondResult).toMatchObject({
        uuid: decoded.sub,
      });
    } catch (error) {
      throw error;
    }

    expect(1).toBe(1);
  });
});
