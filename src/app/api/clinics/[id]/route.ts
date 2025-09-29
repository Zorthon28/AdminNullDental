import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: parseInt(params.id) },
      include: { licenses: true },
    });

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    return NextResponse.json(clinic);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clinic" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const clinic = await prisma.clinic.update({
      where: { id: parseInt(params.id) },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.clinic.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete clinic" },
      { status: 500 }
    );
  }
}
