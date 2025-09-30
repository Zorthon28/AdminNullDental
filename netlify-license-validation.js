import { jwtVerify } from "jose";
import { createPublicKey } from "crypto";
import { PrismaClient } from "./prisma/generated/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { license } = req.body;

  if (!license) {
    return res
      .status(400)
      .json({ valid: false, error: "License token required" });
  }

  try {
    // ES256 Public Key for JWT verification
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDMqAf0Y3alNfzI1+BLNBAyRIjf78
hq/hFp7AQFKTbrM24vA2N63Pl7e1zeNjMaXLnBuRuPr5Q5OrUHrXAu+7rw==
-----END PUBLIC KEY-----`;
    const publicKey = createPublicKey(publicKeyPem);

    // Verify JWT signature and claims
    const { payload } = await jwtVerify(license, publicKey, {
      issuer: "admin.nulldental.com",
      audience: "clinic-app",
    });

    console.log("JWT verified successfully:", payload);

    // Check if license exists and is active in database
    const licenseRecord = await prisma.license.findUnique({
      where: { id: payload.licenseId },
      include: { clinic: true },
    });

    if (!licenseRecord || !licenseRecord.clinic) {
      return res.status(400).json({ valid: false, error: "License not found" });
    }

    // Check if license is expired
    const now = new Date();
    if (licenseRecord.supportExpiry < now) {
      return res.status(400).json({
        valid: false,
        error: "License expired",
        expired: true,
      });
    }

    // Check if license is revoked
    if (licenseRecord.status === "Revoked") {
      return res.status(400).json({ valid: false, error: "License revoked" });
    }

    // Check if this is the first activation
    const isFirstActivation = !licenseRecord.firstActivated;
    if (isFirstActivation) {
      // Update firstActivated timestamp
      await prisma.license.update({
        where: { id: licenseRecord.id },
        data: { firstActivated: new Date() },
      });
    }

    // Return validation result with license details
    return res.status(200).json({
      valid: true,
      firstActivation: isFirstActivation,
      license: {
        id: licenseRecord.id,
        clinicId: licenseRecord.clinicId,
        clinicName: licenseRecord.clinic.name,
        clinicDomain: licenseRecord.clinic.domain,
        type: licenseRecord.type,
        version: licenseRecord.version,
        activationDate: licenseRecord.activationDate,
        firstActivated: isFirstActivation
          ? new Date().toISOString()
          : licenseRecord.firstActivated?.toISOString(),
        supportExpiry: licenseRecord.supportExpiry,
      },
    });
  } catch (error) {
    console.error("License validation error:", error.message);
    return res.status(500).json({ valid: false, error: "Validation failed" });
  }
}
