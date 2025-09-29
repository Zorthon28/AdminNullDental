import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { sendLicenseExpiryWarningEmail } from "../../../../lib/email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get global settings
    const settingsResponse = await fetch(
      "http://localhost:3000/api/global-settings"
    );
    if (!settingsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    const settings = await settingsResponse.json();
    const emailEnabled =
      settings.find((s: any) => s.key === "emailNotificationsEnabled")
        ?.value === "true";
    const expiryWarningEnabled =
      settings.find((s: any) => s.key === "emailLicenseExpiringSoon")?.value ===
      "true";
    const warningDays = parseInt(
      settings.find((s: any) => s.key === "licenseExpiryWarningDays")?.value ||
        "14"
    );
    const adminEmail = settings.find(
      (s: any) => s.key === "adminEmailAddress"
    )?.value;

    if (!emailEnabled || !expiryWarningEnabled || !adminEmail) {
      return NextResponse.json({
        message: "Email notifications disabled or not configured",
        sent: 0,
      });
    }

    // Find licenses expiring within the warning period
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + warningDays);

    const expiringLicenses = await prisma.license.findMany({
      where: {
        status: "Active",
        supportExpiry: {
          lte: warningDate,
          gt: new Date(), // Not already expired
        },
      },
      include: { clinic: true },
    });

    let sentCount = 0;

    // Send warning emails
    for (const license of expiringLicenses) {
      const daysUntilExpiry = Math.ceil(
        (new Date(license.supportExpiry).getTime() - Date.now()) /
          (24 * 60 * 60 * 1000)
      );

      try {
        await sendLicenseExpiryWarningEmail(adminEmail, {
          clinicName: license.clinic.name,
          clinicDomain: license.clinic.domain,
          licenseType: license.type,
          version: license.version,
          supportExpiry: new Date(license.supportExpiry).toLocaleDateString(),
          daysUntilExpiry,
        });
        sentCount++;
      } catch (emailError) {
        console.error(
          `Failed to send expiry warning for license ${license.id}:`,
          emailError
        );
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} license expiry warnings`,
      sent: sentCount,
      checked: expiringLicenses.length,
    });
  } catch (error) {
    console.error("Error sending license expiry warnings:", error);
    return NextResponse.json(
      { error: "Failed to send license expiry warnings" },
      { status: 500 }
    );
  }
}
