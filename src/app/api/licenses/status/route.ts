import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get("licenseId");

    if (!licenseId) {
      return NextResponse.json(
        { error: "licenseId is required" },
        { status: 400 }
      );
    }

    const license = await prisma.license.findUnique({
      where: { id: parseInt(licenseId) },
      select: { status: true, lastVerified: true },
    });

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    // Update lastVerified
    await prisma.license.update({
      where: { id: parseInt(licenseId) },
      data: { lastVerified: new Date() },
    });

    return NextResponse.json({
      status: license.status,
      lastVerified: license.lastVerified,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check license status" },
      { status: 500 }
    );
  }
}
