import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { sendWeeklyReportEmail } from "../../../../lib/email";

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
    const weeklyReportEnabled =
      settings.find((s: any) => s.key === "emailWeeklyReports")?.value ===
      "true";
    const adminEmail = settings.find(
      (s: any) => s.key === "adminEmailAddress"
    )?.value;

    if (!emailEnabled || !weeklyReportEnabled || !adminEmail) {
      return NextResponse.json({
        message: "Weekly reports disabled or not configured",
        sent: false,
      });
    }

    // Get statistics for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalLicenses, activeLicenses, totalClinics, newClinicsThisWeek] =
      await Promise.all([
        prisma.license.count(),
        prisma.license.count({ where: { status: "Active" } }),
        prisma.clinic.count(),
        prisma.clinic.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      ]);

    const stats = {
      totalLicenses,
      activeLicenses,
      totalClinics,
      newClinicsThisWeek,
    };

    // Send weekly report email
    await sendWeeklyReportEmail(adminEmail, {
      ...stats,
      reportDate: new Date().toLocaleDateString(),
    });

    return NextResponse.json({
      message: "Weekly report sent successfully",
      sent: true,
      stats,
    });
  } catch (error) {
    console.error("Error sending weekly report:", error);
    return NextResponse.json(
      { error: "Failed to send weekly report" },
      { status: 500 }
    );
  }
}
