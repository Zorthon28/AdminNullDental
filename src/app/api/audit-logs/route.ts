import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const queryOptions: any = {
      include: { adminUser: true },
      orderBy: { timestamp: "desc" },
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const logs = await prisma.auditLog.findMany(queryOptions);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminUserId, action, details } = await request.json();

    // Ensure admin user exists, create if not
    let adminUser = await prisma.adminUser.findUnique({
      where: { id: adminUserId },
    });

    if (!adminUser) {
      adminUser = await prisma.adminUser.create({
        data: {
          id: adminUserId,
          email: `admin${adminUserId}@nulldental.com`,
          name: `Admin User ${adminUserId}`,
        },
      });
    }

    const log = await prisma.auditLog.create({
      data: { adminUserId, action, details },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Audit log creation error:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
