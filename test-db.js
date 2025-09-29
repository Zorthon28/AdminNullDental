const { PrismaClient } = require("./src/generated/prisma");

async function main() {
  const prisma = new PrismaClient();

  try {
    const plans = await prisma.pricingPlan.findMany();
    console.log("Found", plans.length, "pricing plans:");
    plans.forEach((plan) => {
      console.log(
        `- ${plan.name}: ${plan.monthlyPrice} cents (${plan.monthlyPrice / 100} MXN)`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
