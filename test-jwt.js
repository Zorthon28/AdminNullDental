const { SignJWT } = require("jose");
const { createPrivateKey, createPublicKey } = require("crypto");
const { readFileSync } = require("fs");
const { join } = require("path");

async function testJWT() {
  try {
    console.log("Testing JWT signing...");

    // Get private key
    const privateKeyPem = readFileSync(
      join(process.cwd(), "keys/private.pem"),
      "utf8"
    );
    const privateKey = createPrivateKey(privateKeyPem);

    console.log("Private key loaded successfully");

    // Create JWT
    const jwt = await new SignJWT({
      licenseId: 1,
      clinicId: 1,
      type: "Standalone",
      version: "1.0",
      activationDate: new Date().toISOString(),
      supportExpiry: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt()
      .setIssuer("admin.nulldental.com")
      .setAudience("clinic-app")
      .sign(privateKey);

    console.log("JWT created successfully:", jwt.substring(0, 50) + "...");

    // Test verification
    const publicKeyPem = readFileSync(
      join(process.cwd(), "keys/public.pem"),
      "utf8"
    );
    const publicKey = createPublicKey(publicKeyPem);

    const { jwtVerify } = require("jose");
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: "admin.nulldental.com",
      audience: "clinic-app",
    });

    console.log("JWT verification successful:", payload);
  } catch (error) {
    console.error("JWT test failed:", error);
  }
}

testJWT();
