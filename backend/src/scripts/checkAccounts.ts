/**
 * Utility script to check accounts in the database
 * Run with: npx tsx src/scripts/checkAccounts.ts
 */

import { prisma } from "../db/client";

async function checkAccounts() {
  try {
    console.log("🔍 Checking accounts in database...\n");

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log(`📊 Found ${users.length} user(s):\n`);
    users.forEach((user) => {
      console.log(`  - ${user.name || user.email} (ID: ${user.id})`);
    });

    console.log("\n💰 Accounts by user:\n");

    for (const user of users) {
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
      });

      console.log(`  User: ${user.name || user.email}`);
      
      if (accounts.length === 0) {
        console.log(`    ⚠️  No accounts found`);
      } else {
        accounts.forEach((account) => {
          console.log(`    ✅ ${account.name} (${account.type}) - ID: ${account.id}`);
        });
      }
      console.log("");
    }

    // Check if any users have no accounts
    const usersWithoutAccounts = [];
    for (const user of users) {
      const accountCount = await prisma.account.count({
        where: { userId: user.id },
      });
      if (accountCount === 0) {
        usersWithoutAccounts.push(user);
      }
    }

    if (usersWithoutAccounts.length > 0) {
      console.log("\n⚠️  Users without accounts:");
      usersWithoutAccounts.forEach((user) => {
        console.log(`  - ${user.name || user.email} (ID: ${user.id})`);
      });
      console.log("\n💡 These users need to create accounts before making transactions.");
      console.log("   Use POST /api/accounts with body: { name: 'Account Name', type: 'WALLET' }");
    }

    console.log("\n✅ Check complete!\n");
  } catch (error) {
    console.error("❌ Error checking accounts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
