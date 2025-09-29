import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { SignJWT } from "jose";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createPrivateKey, randomUUID, generateKeyPairSync } from "crypto";
import { sendLicenseIssuedEmail } from "../../../lib/email";

const prisma = new PrismaClient();

// Function to get or create private key
function getPrivateKey() {
  const keyPath = join(process.cwd(), "keys/private.pem");

  if (!existsSync(keyPath)) {
    // Generate keys if they don't exist
    const { privateKey, publicKey } = generateKeyPairSync("ec", {
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

    // Write to files (this will work in development, but may not in production)
    try {
      const fs = require("fs");
      const keysDir = join(process.cwd(), "keys");
      if (!fs.existsSync(keysDir)) {
        fs.mkdirSync(keysDir, { recursive: true });
      }
      fs.writeFileSync(keyPath, privateKey);
      fs.writeFileSync(join(process.cwd(), "keys/public.pem"), publicKey);
    } catch (error) {
      console.warn("Could not write keys to disk, using in-memory keys");
    }

    return createPrivateKey(privateKey);
  }

  const privateKeyPem = readFileSync(keyPath, "utf8");
  return createPrivateKey(privateKeyPem);
}

export async function GET() {
  try {
    const licenses = await prisma.license.findMany({
      include: { clinic: true },
    });
    return NextResponse.json(licenses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      clinicId,
      type,
      supportExpiry,
      version = "1.0",
    } = await request.json();

    // Create license with temporary key
    const tempKey = randomUUID();
    const license = await prisma.license.create({
      data: { clinicId, key: tempKey, type, supportExpiry, version },
    });

    // Generate signed JWT
    const privateKey = getPrivateKey();
    const jwt = await new SignJWT({
      licenseId: license.id,
      clinicId: license.clinicId,
      type: license.type,
      version: license.version,
      activationDate: license.activationDate.toISOString(),
      supportExpiry: license.supportExpiry.toISOString(),
    })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt()
      .setIssuer("admin.nulldental.com")
      .setAudience("clinic-app")
      .sign(privateKey);

    // Update license with the signed JWT as key
    const updatedLicense = await prisma.license.update({
      where: { id: license.id },
      data: { key: jwt },
      include: { clinic: true },
    });

    // Send email notification if enabled
    try {
      const settingsResponse = await fetch(
        "http://localhost:3000/api/global-settings"
      );
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        const emailEnabled =
          settings.find((s: any) => s.key === "emailNotificationsEnabled")
            ?.value === "true";
        const adminEmail = settings.find(
          (s: any) => s.key === "adminEmailAddress"
        )?.value;

        if (emailEnabled && adminEmail) {
          await sendLicenseIssuedEmail(adminEmail, {
            clinicName: updatedLicense.clinic.name,
            clinicDomain: updatedLicense.clinic.domain,
            licenseType: updatedLicense.type,
            version: updatedLicense.version,
            activationDate: new Date(
              updatedLicense.activationDate
            ).toLocaleDateString(),
            supportExpiry: new Date(
              updatedLicense.supportExpiry
            ).toLocaleDateString(),
          });
        }
      }
    } catch (emailError) {
      console.error("Failed to send license issued email:", emailError);
      // Don't fail the license creation if email fails
    }

    return NextResponse.json(updatedLicense, { status: 201 });
  } catch (error) {
    console.error("Error creating license:", error);
    return NextResponse.json(
      { error: "Failed to create license" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const license = await prisma.license.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(license);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update license" },
      { status: 500 }
    );
  }
}
