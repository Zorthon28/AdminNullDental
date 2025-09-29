const { PrismaClient } = require("./src/generated/prisma");

const prisma = new PrismaClient();

const pricingPlans = [
  {
    id: "basic-monthly",
    name: "Basic Monthly",
    type: "Subscription",
    monthlyPrice: 280000, // 2800 MXN in cents
    yearlyPrice: 2800000, // 28000 MXN in cents
    description: "Basic subscription - Monthly billing",
  },
  {
    id: "basic-yearly",
    name: "Basic Yearly",
    type: "Subscription",
    monthlyPrice: 280000,
    yearlyPrice: 2800000,
    description: "Basic subscription - Yearly billing",
  },
  {
    id: "standard-monthly",
    name: "Standard Monthly",
    type: "Subscription",
    monthlyPrice: 450000,
    yearlyPrice: 4500000,
    description: "Standard subscription - Monthly billing",
  },
  {
    id: "standard-yearly",
    name: "Standard Yearly",
    type: "Subscription",
    monthlyPrice: 450000,
    yearlyPrice: 4500000,
    description: "Standard subscription - Yearly billing",
  },
  {
    id: "premium-monthly",
    name: "Premium Monthly",
    type: "Subscription",
    monthlyPrice: 700000,
    yearlyPrice: 7000000,
    description: "Premium subscription - Monthly billing",
  },
  {
    id: "premium-yearly",
    name: "Premium Yearly",
    type: "Subscription",
    monthlyPrice: 700000,
    yearlyPrice: 7000000,
    description: "Premium subscription - Yearly billing",
  },
  {
    id: "enterprise-monthly",
    name: "Enterprise Monthly",
    type: "Subscription",
    monthlyPrice: 750000,
    yearlyPrice: 7500000,
    description: "Enterprise subscription - Monthly billing",
  },
  {
    id: "enterprise-yearly",
    name: "Enterprise Yearly",
    type: "Subscription",
    monthlyPrice: 750000,
    yearlyPrice: 7500000,
    description: "Enterprise subscription - Yearly billing",
  },
  {
    id: "standalone",
    name: "Standalone License",
    type: "Standalone",
    monthlyPrice: 4500000, // 45000 MXN in cents
    yearlyPrice: 4500000,
    description: "One-time standalone license purchase",
  },
];

async function main() {
  console.log("Seeding pricing plans...");

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  console.log("Pricing plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
