/**
 * Make a user an admin
 * Run with: npx tsx src/scripts/makeUserAdmin.ts <email>
 */
import { prisma } from "../db/client";

async function makeUserAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("\n❌ Please provide an email address");
    console.log("Usage: npx tsx src/scripts/makeUserAdmin.ts <email>\n");
    process.exit(1);
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`\n❌ User not found: ${email}\n`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`\n✅ ${user.name || user.email} is already an admin!\n`);
      process.exit(0);
    }

    // Update user role to ADMIN
    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log("\n✅ User promoted to ADMIN successfully!\n");
    console.log("👑 Admin Details:");
    console.log(`   Name: ${updated.name || "N/A"}`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role: ${updated.role}`);
    console.log(`   ID: ${updated.id}\n`);
    console.log("🎉 You can now access the admin dashboard at: http://localhost:3000/admin/dashboard\n");

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
