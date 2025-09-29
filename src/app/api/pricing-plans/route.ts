import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/pricing-plans - Get all pricing plans
export async function GET() {
  try {
    const pricingPlans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    // Convert prices from cents to MXN
    const formattedPlans = pricingPlans.map((plan) => ({
      ...plan,
      monthlyPrice: plan.monthlyPrice / 100,
      yearlyPrice: plan.yearlyPrice / 100,
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}

// POST /api/pricing-plans - Create a new pricing plan
export async function POST(request: NextRequest) {
  try {
    const { name, type, monthlyPrice, yearlyPrice, description } =
      await request.json();

    // Convert prices to cents
    const monthlyPriceCents = Math.round(monthlyPrice * 100);
    const yearlyPriceCents = Math.round(yearlyPrice * 100);

    const pricingPlan = await prisma.pricingPlan.create({
      data: {
        name,
        type,
        monthlyPrice: monthlyPriceCents,
        yearlyPrice: yearlyPriceCents,
        description,
      },
    });

    // Return with prices in MXN
    const formattedPlan = {
      ...pricingPlan,
      monthlyPrice: pricingPlan.monthlyPrice / 100,
      yearlyPrice: pricingPlan.yearlyPrice / 100,
    };

    return NextResponse.json(formattedPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to create pricing plan" },
      { status: 500 }
    );
  }
}
