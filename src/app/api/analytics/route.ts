import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6months";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    // Get all licenses with clinic data
    const licenses = await prisma.license.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        clinic: true,
      },
    });

    // Get all clinics
    const clinics = await prisma.clinic.findMany({
      include: {
        licenses: true,
      },
    });

    // Get audit logs for activity tracking
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Calculate license statistics
    const licenseStats = {
      active: licenses.filter((l) => l.status === "Active").length,
      expired: licenses.filter((l) => l.status === "Expired").length,
      revoked: licenses.filter((l) => l.status === "Revoked").length,
      total: licenses.length,
    };

    // Calculate revenue data
    const revenueData = licenses.reduce(
      (acc, license) => {
        const month = new Date(license.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        const price = license.price || 0;

        if (!acc[month]) {
          acc[month] = { month, standalone: 0, subscription: 0, total: 0 };
        }

        if (license.type === "Standalone") {
          acc[month].standalone += price;
        } else {
          acc[month].subscription += price;
        }
        acc[month].total += price;

        return acc;
      },
      {} as Record<string, any>
    );

    // Calculate clinic growth over time
    const clinicGrowth = clinics.reduce(
      (acc, clinic) => {
        const month = new Date(clinic.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        if (!acc[month]) {
          acc[month] = { month, count: 0 };
        }
        acc[month].count++;

        return acc;
      },
      {} as Record<string, any>
    );

    // Calculate audit activity by action type
    const auditActivity = auditLogs.reduce(
      (acc, log) => {
        const date = new Date(log.timestamp).toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!acc[date]) {
          acc[date] = {};
        }

        if (!acc[date][log.action]) {
          acc[date][log.action] = 0;
        }
        acc[date][log.action]++;

        return acc;
      },
      {} as Record<string, Record<string, number>>
    );

    // Calculate license status distribution
    const licenseStatusData = [
      { name: "Active", value: licenseStats.active, color: "#10b981" },
      { name: "Expired", value: licenseStats.expired, color: "#f59e0b" },
      { name: "Revoked", value: licenseStats.revoked, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    // Calculate license type distribution
    const licenseTypeData = licenses.reduce(
      (acc, license) => {
        const existing = acc.find((item) => item.name === license.type);
        if (existing) {
          existing.value++;
        } else {
          acc.push({
            name: license.type,
            value: 1,
            color: license.type === "Standalone" ? "#3b82f6" : "#10b981",
          });
        }
        return acc;
      },
      [] as Array<{ name: string; value: number; color: string }>
    );

    // Calculate monthly trends
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const monthLicenses = licenses.filter(
        (l) =>
          new Date(l.createdAt).getMonth() === date.getMonth() &&
          new Date(l.createdAt).getFullYear() === date.getFullYear()
      );

      monthlyTrends.push({
        month: monthKey,
        licenses: monthLicenses.length,
        revenue: monthLicenses.reduce((sum, l) => sum + (l.price || 0), 0),
        clinics: clinics.filter(
          (c) =>
            new Date(c.createdAt).getMonth() === date.getMonth() &&
            new Date(c.createdAt).getFullYear() === date.getFullYear()
        ).length,
      });
    }

    // Calculate summary metrics
    const totalRevenue = licenses.reduce((sum, l) => sum + (l.price || 0), 0);
    const averageRevenuePerLicense =
      licenseStats.total > 0 ? totalRevenue / licenseStats.total : 0;

    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const expiringSoon = licenses.filter(
      (l) =>
        l.status === "Active" &&
        new Date(l.supportExpiry) >= now &&
        new Date(l.supportExpiry) <= thirtyDaysFromNow
    ).length;

    return NextResponse.json({
      summary: {
        totalLicenses: licenseStats.total,
        activeLicenses: licenseStats.active,
        expiredLicenses: licenseStats.expired,
        revokedLicenses: licenseStats.revoked,
        totalClinics: clinics.length,
        totalRevenue,
        averageRevenuePerLicense,
        expiringSoon,
        totalAuditLogs: auditLogs.length,
      },
      charts: {
        licenseStatus: licenseStatusData,
        licenseType: licenseTypeData,
        revenueByMonth: Object.values(revenueData),
        clinicGrowth: Object.values(clinicGrowth),
        monthlyTrends,
        auditActivity: Object.entries(auditActivity)
          .map(([date, actions]) => ({
            date,
            ...actions,
          }))
          .slice(-30), // Last 30 days
      },
      period,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
