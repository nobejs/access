const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();
const createVerifiedUser = testHelper("createVerifiedUser");
const generateJWT = requireFunction("JWT/generateJWT");
const decodeJWT = requireFunction("JWT/decodeJWT");

// yarn test -i src/stories/Users/CanLogin/token_gen.spec.js

describe("Test Handler for Token Generation", () => {
  beforeEach(async () => {});

  it("can_generate_jwt", async () => {
    let encoded = {};
    let decoded = {};
    try {
      encoded = await generateJWT("5345345344534", "fixme", {
        team: "r",
        x: "y",
      });
      decoded = await decodeJWT(encoded);
    } catch (error) {
      debugLogger(error);
    }

    // console.log("encoded", encoded);
    // console.log("decoded", decoded);

    expect(decoded).toMatchObject({
      jti: "5345345344534",
    });
  });
});
