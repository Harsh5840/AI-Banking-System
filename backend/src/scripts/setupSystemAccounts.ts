/**
 * Setup system accounts for handling income/expense transactions
 * Run with: npx tsx src/scripts/setupSystemAccounts.ts
 */

import { prisma } from "../db/client";
import { AccountType } from "@prisma/client";

const SYSTEM_USER_EMAIL = "system@ledgerx.internal";
const SYSTEM_ACCOUNTS = [
  { name: "External Income", type: AccountType.WALLET, description: "System account for all income transactions" },
  { name: "External Expense", type: AccountType.WALLET, description: "System account for all expense transactions" },
  { name: "External Transfer", type: AccountType.WALLET, description: "System account for external transfers" },
];

async function setupSystemAccounts() {
  try {
    console.log("🔧 Setting up system accounts...\n");

    // Create or get system user
    let systemUser = await prisma.user.findUnique({
      where: { email: SYSTEM_USER_EMAIL },
    });

    if (!systemUser) {
      console.log("Creating system user...");
      systemUser = await prisma.user.create({
        data: {
          email: SYSTEM_USER_EMAIL,
          name: "System",
          role: "ADMIN",
        },
      });
      console.log(`✅ System user created: ${systemUser.id}\n`);
    } else {
      console.log(`✅ System user exists: ${systemUser.id}\n`);
    }

    // Create system accounts
    console.log("Creating system accounts...\n");
    
    for (const accountData of SYSTEM_ACCOUNTS) {
      const existing = await prisma.account.findFirst({
        where: {
          name: accountData.name,
          userId: systemUser.id,
        },
      });

      if (!existing) {
        const account = await prisma.account.create({
          data: {
            name: accountData.name,
            type: accountData.type,
            userId: systemUser.id,
          },
        });
        console.log(`✅ Created: ${account.name}`);
        console.log(`   ID: ${account.id}`);
        console.log(`   Use for: ${accountData.description}\n`);
      } else {
        console.log(`✅ Already exists: ${existing.name}`);
        console.log(`   ID: ${existing.id}\n`);
      }
    }

    // Display all system accounts
    const allSystemAccounts = await prisma.account.findMany({
      where: { userId: systemUser.id },
    });

    console.log("\n📋 All System Accounts:");
    console.log("─".repeat(60));
    allSystemAccounts.forEach((acc) => {
      console.log(`${acc.name.padEnd(25)} | ${acc.id}`);
    });
    console.log("─".repeat(60));

    console.log("\n✅ System accounts setup complete!\n");
    console.log("💡 Add these to your .env file:");
    console.log(`SYSTEM_USER_ID=${systemUser.id}`);
    
    const incomeAccount = allSystemAccounts.find(a => a.name === "External Income");
    const expenseAccount = allSystemAccounts.find(a => a.name === "External Expense");
    
    if (incomeAccount) console.log(`SYSTEM_INCOME_ACCOUNT_ID=${incomeAccount.id}`);
    if (expenseAccount) console.log(`SYSTEM_EXPENSE_ACCOUNT_ID=${expenseAccount.id}`);

  } catch (error) {
    console.error("❌ Error setting up system accounts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSystemAccounts();
