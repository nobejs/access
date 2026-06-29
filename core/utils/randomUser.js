const crypto = require("crypto");
var uuid = require("uuid");

const base64url = (obj) =>
  Buffer.from(JSON.stringify(obj)).toString("base64url");

const generateToken = (sub = uuid.v4()) => {
  const secret = "we-dont-care-cuz-this-is-only-for-testing";
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const payload = base64url({ sub });
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  const token = `${header}.${payload}.${signature}`;
  return { user_uuid: sub, token };
};

if (uuid.validate(process.argv[2])) {
  let result = generateToken(process.argv[2]);
  console.log(result);
}

if (!process.argv[2]) {
  let result = generateToken();
  console.log(result);
}

module.exports = generateToken;
