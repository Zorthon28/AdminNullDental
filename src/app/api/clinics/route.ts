import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { sendNewClinicNotificationEmail } from "../../../lib/email";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      include: { licenses: true },
    });
    return NextResponse.json(clinics);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clinics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      domain,
      dbConnectionString,
      licenseType,
      adminContact,
      supportExpiry,
    } = await request.json();
    const clinic = await prisma.clinic.create({
      data: {
        name,
        domain,
        dbConnectionString,
        licenseType,
        adminContact,
        supportExpiry,
      },
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
        const newClinicEmailEnabled =
          settings.find((s: any) => s.key === "emailNewClinicAdded")?.value ===
          "true";
        const adminEmail = settings.find(
          (s: any) => s.key === "adminEmailAddress"
        )?.value;

        if (emailEnabled && newClinicEmailEnabled && adminEmail) {
          await sendNewClinicNotificationEmail(adminEmail, {
            clinicName: clinic.name,
            clinicDomain: clinic.domain,
            licenseType: clinic.licenseType,
            adminContact: clinic.adminContact,
            registrationDate: new Date(clinic.createdAt).toLocaleDateString(),
          });
        }
      }
    } catch (emailError) {
      console.error("Failed to send new clinic email:", emailError);
      // Don't fail the clinic creation if email fails
    }

    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create clinic" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const clinic = await prisma.clinic.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(clinic);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update clinic" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");
    await prisma.clinic.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete clinic" },
      { status: 500 }
    );
  }
}
