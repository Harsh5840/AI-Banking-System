/**
 * Check user roles
 */
import { prisma } from "../db/client";

async function checkUserRoles() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log("\n👥 Users in Database:\n");
    console.log("=".repeat(60));

    users.forEach((user) => {
      const displayName = user.name || user.email;
      const roleEmoji = user.role === "ADMIN" ? "👑" : user.role === "AUDITOR" ? "🔍" : "👤";
      console.log(`${roleEmoji} ${displayName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log("");
    });

    console.log("=".repeat(60));

    const adminCount = users.filter((u) => u.role === "ADMIN").length;
    const userCount = users.filter((u) => u.role === "USER").length;

    console.log(`\n📊 Summary:`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Total: ${users.length}\n`);

    if (adminCount === 0) {
      console.log("⚠️  No admin users found!");
      console.log("💡 To make a user admin, run:");
      console.log("   npx tsx src/scripts/makeUserAdmin.ts <user-email>\n");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();
