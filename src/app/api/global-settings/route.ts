import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.globalSetting.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch global settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    const setting = await prisma.globalSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update global setting" },
      { status: 500 }
    );
  }
}
