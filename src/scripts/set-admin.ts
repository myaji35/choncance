import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAdmin() {
  try {
    // Get the email from command line argument
    const email = process.argv[2];

    if (!email) {
      console.log("Usage: npm run set-admin <email>");
      console.log("Example: npm run set-admin user@example.com");
      process.exit(1);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ User ${updatedUser.email} is now an ADMIN`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Role: ${updatedUser.role}`);
  } catch (error) {
    console.error("Error setting admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
