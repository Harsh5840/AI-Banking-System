/**
 * Setup test accounts for development
 * Run with: npx tsx src/scripts/setupTestAccounts.ts
 */

import { prisma } from "../db/client";
import { AccountType } from "@prisma/client";

async function setupTestAccounts() {
  try {
    console.log("🚀 Setting up test accounts...\n");

    // Get all users
    const users = await prisma.user.findMany();

    for (const user of users) {
      console.log(`\n👤 User: ${user.name || user.email}`);

      // Check existing accounts
      const existingAccounts = await prisma.account.findMany({
        where: { userId: user.id },
      });

      if (existingAccounts.length === 0) {
        console.log("   Creating default accounts...");

        // Create a Wallet account
        const wallet = await prisma.account.create({
          data: {
            name: "Main Wallet",
            type: AccountType.PERSONAL_LEGACY,
            userId: user.id,
          },
        });
        console.log(`   ✅ Created: ${wallet.name} (${wallet.type}) - ${wallet.id}`);

        // Create a Savings account
        const savings = await prisma.account.create({
          data: {
            name: "Savings (Legacy)",
            type: AccountType.PERSONAL_LEGACY,
            userId: user.id,
          },
        });
        console.log(`   ✅ Created: ${savings.name} (${savings.type}) - ${savings.id}`);
      } else {
        console.log(`   Already has ${existingAccounts.length} account(s):`);
        existingAccounts.forEach((acc) => {
          console.log(`   - ${acc.name} (${acc.type}) - ${acc.id}`);
        });
      }
    }

    console.log("\n✅ Setup complete!\n");
  } catch (error) {
    console.error("❌ Error setting up accounts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestAccounts();
