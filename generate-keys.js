const crypto = require("crypto");
const fs = require("fs");

// Generate ECDSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Write to files
fs.writeFileSync("keys/private.pem", privateKey);
fs.writeFileSync("keys/public.pem", publicKey);

console.log("Keys generated successfully.");
