/**
 * Quick test script to demonstrate transaction reversal
 * Run with: npx tsx src/scripts/testReversal.ts
 */
import { prisma } from "../db/client";

async function testReversal() {
  console.log("\n🔄 Transaction Reversal Test\n");
  console.log("=".repeat(60));

  try {
    // 1. Find all transactions
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`\n📊 Found ${transactions.length} recent transactions\n`);

    // 2. Check which can be reversed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reversibleTransactions = transactions.filter(tx => {
      const isRecent = new Date(tx.createdAt) > thirtyDaysAgo;
      const notReversed = !tx.parentId;
      const isCompleted = true; // Assuming completed
      
      return isRecent && notReversed && isCompleted;
    });

    console.log(`✅ ${reversibleTransactions.length} transactions can be reversed:\n`);

    reversibleTransactions.forEach((tx, idx) => {
      console.log(`${idx + 1}. Transaction ${tx.id}`);
      console.log(`   User: ${tx.user?.name || tx.user?.email || 'Unknown'}`);
      console.log(`   Amount: $${tx.amount.toFixed(2)}`);
      console.log(`   Description: ${tx.description || 'N/A'}`);
      console.log(`   Date: ${tx.createdAt.toLocaleDateString()}`);
      console.log(`   Age: ${Math.floor((Date.now() - tx.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days old`);
      console.log();
    });

    // 3. Find already reversed transactions
    const reversedTransactions = transactions.filter(tx => tx.parentId !== null);
    
    if (reversedTransactions.length > 0) {
      console.log(`\n🔄 ${reversedTransactions.length} transactions already reversed:\n`);
      
      reversedTransactions.forEach((tx, idx) => {
        console.log(`${idx + 1}. Reversal ${tx.id}`);
        console.log(`   Original: ${tx.parentId}`);
        console.log(`   Amount: $${tx.amount.toFixed(2)}`);
        console.log(`   Date: ${tx.createdAt.toLocaleDateString()}`);
        console.log();
      });
    }

    // 4. Show instructions
    console.log("\n" + "=".repeat(60));
    console.log("\n🎯 How to Test Reversal:\n");
    console.log("1. Login as admin at: http://localhost:3000/login");
    console.log("   Email: gautamharsh584@gmail.com");
    console.log("\n2. Go to: http://localhost:3000/admin/transactions");
    console.log("\n3. Look for transactions with 'Quick Reverse' button");
    
    if (reversibleTransactions.length > 0) {
      console.log(`\n4. Try reversing transaction: ${reversibleTransactions[0].id}`);
      console.log(`   Description: ${reversibleTransactions[0].description || 'N/A'}`);
      console.log(`   Amount: $${reversibleTransactions[0].amount.toFixed(2)}`);
    } else {
      console.log("\n⚠️  No transactions available for reversal!");
      console.log("   Create a new transaction first, then try reversing it.");
    }

    console.log("\n5. View reversal history at:");
    console.log("   http://localhost:3000/admin/reversal/history");

    console.log("\n" + "=".repeat(60));

    // 5. Show API example
    if (reversibleTransactions.length > 0) {
      const testTx = reversibleTransactions[0];
      console.log("\n📡 Or test via API (PowerShell):\n");
      console.log('$token = "YOUR_JWT_TOKEN"');
      console.log('$headers = @{');
      console.log('    Authorization = "Bearer $token"');
      console.log('    "Content-Type" = "application/json"');
      console.log('}');
      console.log('$body = @{ reason = "Test reversal" } | ConvertTo-Json');
      console.log(`\nInvoke-RestMethod -Uri "http://localhost:5000/api/reversal/tx_${testTx.id.slice(0, 8)}/reverse" \\`);
      console.log('    -Method POST -Headers $headers -Body $body');
      console.log("\n" + "=".repeat(60));
    }

    // 6. Statistics
    console.log("\n📈 Statistics:\n");
    console.log(`Total transactions: ${transactions.length}`);
    console.log(`Reversible: ${reversibleTransactions.length}`);
    console.log(`Already reversed: ${reversedTransactions.length}`);
    console.log(`Total volume: $${transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0).toFixed(2)}`);
    
    console.log("\n✨ Test script complete!\n");

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testReversal();
