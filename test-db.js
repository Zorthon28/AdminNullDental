const { PrismaClient } = require("./src/generated/prisma");

async function main() {
  const prisma = new PrismaClient();

  try {
    const plans = await prisma.pricingPlan.findMany();
    console.log("Found", plans.length, "pricing plans:");
    plans.forEach((plan) => {
      console.log(
        `- ${plan.name}: ${plan.monthlyPrice} cents (${plan.monthlyPrice / 100} MXN) - Active: ${plan.isActive}`
      );
    });

    const activePlans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
    });
    console.log("Found", activePlans.length, "active pricing plans");

    const clinics = await prisma.clinic.findMany();
    console.log("\nFound", clinics.length, "clinics:");
    clinics.forEach((clinic) => {
      console.log(`- ${clinic.name} (${clinic.domain})`);
    });

    const licenses = await prisma.license.findMany();
    console.log("\nFound", licenses.length, "licenses");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
