const crypto = require("crypto");

let pair = crypto.generateKeyPairSync("ed25519", {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

function fix(str) {
  return str.replace(/\n/g, "\\n") + "\n";
}

console.log("Public Key:", fix(pair.publicKey));
console.log("Private Key:", fix(pair.privateKey));
console.log(
  "Paste above keys in ENV or however you pass secrets to your node ENV."
);
