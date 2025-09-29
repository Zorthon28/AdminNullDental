const { PrismaClient } = require("./src/generated/prisma");

async function testLicenseCreation() {
  const prisma = new PrismaClient();

  try {
    console.log("Testing license creation...");

    // Get a clinic
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      console.error("No clinics found");
      return;
    }
    console.log("Using clinic:", clinic.name);

    // Create license
    const license = await prisma.license.create({
      data: {
        clinicId: clinic.id,
        key: "test-key",
        type: "Standalone",
        supportExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        version: "1.0",
      },
    });

    console.log("License created:", license.id);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLicenseCreation();
