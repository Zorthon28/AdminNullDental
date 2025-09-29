import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/pricing-plans/[id] - Get a specific pricing plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pricingPlan = await prisma.pricingPlan.findUnique({
      where: { id: params.id },
    });

    if (!pricingPlan) {
      return NextResponse.json(
        { error: "Pricing plan not found" },
        { status: 404 }
      );
    }

    // Convert prices from cents to MXN
    const formattedPlan = {
      ...pricingPlan,
      monthlyPrice: pricingPlan.monthlyPrice / 100,
      yearlyPrice: pricingPlan.yearlyPrice / 100,
    };

    return NextResponse.json(formattedPlan);
  } catch (error) {
    console.error("Error fetching pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plan" },
      { status: 500 }
    );
  }
}

// PUT /api/pricing-plans/[id] - Update a pricing plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, type, monthlyPrice, yearlyPrice, description, isActive } =
      await request.json();

    // Convert prices to cents
    const monthlyPriceCents = Math.round(monthlyPrice * 100);
    const yearlyPriceCents = Math.round(yearlyPrice * 100);

    const pricingPlan = await prisma.pricingPlan.update({
      where: { id: params.id },
      data: {
        name,
        type,
        monthlyPrice: monthlyPriceCents,
        yearlyPrice: yearlyPriceCents,
        description,
        isActive,
      },
    });

    // Return with prices in MXN
    const formattedPlan = {
      ...pricingPlan,
      monthlyPrice: pricingPlan.monthlyPrice / 100,
      yearlyPrice: pricingPlan.yearlyPrice / 100,
    };

    return NextResponse.json(formattedPlan);
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to update pricing plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/pricing-plans/[id] - Delete a pricing plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by setting isActive to false
    const pricingPlan = await prisma.pricingPlan.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Pricing plan deactivated" });
  } catch (error) {
    console.error("Error deactivating pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to deactivate pricing plan" },
      { status: 500 }
    );
  }
}
