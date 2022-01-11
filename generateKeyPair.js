const crypto = require("crypto");
const fs = require("fs-extra");
const jose = require("jose");

if (process.env.ENVFILE) {
  var dotenv = require("dotenv");
  dotenv.config({ path: process.env.ENVFILE });
}

const publicKeyEnv = process.env.PUBLIC_KEY.replace(/\\n/g, "\n");
const privateKeyEnv = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

(async () => {
  const ecPrivateKey = await jose.importPKCS8(privateKeyEnv, "ed25519");
  const ecPublicKey = await jose.importSPKI(publicKeyEnv, "ed25519");

  const jwt = await new jose.SignJWT({ "urn:example:claim": true })
    .setProtectedHeader({ alg: "EdDSA" })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime("1s")
    .sign(ecPrivateKey);

  //   const jwt =
  //     "eyJhbGciOiJFZERTQSJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjM5NDc4NDQyLCJpc3MiOiJ1cm46ZXhhbXBsZTppc3N1ZXIiLCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSIsImV4cCI6MTYzOTQ3ODQ0M30.6AsydXdDabtu86JpQ7-tXwhFfoToPLufzpyZTwByHqTViiO-Wo-F0CxGDy3OIbuin8oWZcPdGa_AiS1zsE_RCQ";

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, ecPublicKey);

  // console.log(jwt, payload);
})();
