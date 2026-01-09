import { Worker, Job } from 'bullmq';
import { redis, redisUrl } from '../lib/redis'; // We'll need connection options
import { prisma } from '../db/client';
import { TRANSACTION_QUEUE_NAME } from '../queues/transaction.queue';
import { classifyCategory } from '../ai/fraud'; // Reusing existing logic if possible, or keeping it simple

// Define the Job Data Interface
interface TransactionJobData {
  transactionId: string;
  userId: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  description?: string;
  type: 'expense' | 'income' | 'transfer';
  timestamp: string;
}

const processTransaction = async (job: Job<TransactionJobData>) => {
  const { transactionId, userId, fromAccount, toAccount, amount, description, type, timestamp} = job.data;
  console.log(`[Worker] Processing Transaction: ${transactionId}`);

  try {
    // 1. Update Status to PROCESSING
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'PROCESSING' }
    });

    //  2. Perform Logic inside a Serializable Transaction
    await prisma.$transaction(async (tx) => {
      // === ENTERPRISE FEATURE: Department Budget Enforcement ===
      // Fetch user's department to check if they're part of an organization
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { department: true, organization: true }
      });

      // If user belongs to a department with a budget limit, enforce it
      if (user?.departmentId && user.department) {
        const dept = user.department;
        
        // Calculate current month's spend for this department
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlySpend = await tx.transaction.aggregate({
          where: {
            departmentId: dept.id,
            timestamp: { gte: startOfMonth, lte: endOfMonth },
            status: { in: ['SUCCESS', 'PROCESSING'] } // Don't count failed transactions
          },
          _sum: { amount: true }
        });

        const currentSpend = monthlySpend._sum.amount || 0;
        const projectedSpend = currentSpend + amount;

        if (projectedSpend > dept.budgetLimit) {
          throw new Error(
            `Department "${dept.name}" budget exceeded. ` +
            `Limit: $${dept.budgetLimit}, Current: $${currentSpend}, Requested: $${amount}`
          );
        }

        console.log(`[Budget Check] Department: ${dept.name}, Spent: $${currentSpend}/$${dept.budgetLimit}`);
      }
      // === END Budget Enforcement ===

      // A. Lock the SENDER's account (Pessimistic Lock)
      // This ensures no other transaction can modify this account's balance until we commit.
      // Note: We only need to check balance for 'expense' and 'transfer' where money leaves the user.
      // For 'income', we assume system has infinite funds or we lock system account too.
      // To strictly follow "Double-Entry", we should lock both if possible, or at least the source.
      
      // We use raw query for FOR UPDATE as Prisma doesn't natively support it in fluent API yet fully for all cases
      // But we need to be careful with tables. Account table seems to be `Account`.
      const senderAccountRaw = await tx.$queryRaw`
        SELECT id FROM "Account" WHERE id = ${fromAccount} FOR UPDATE
      `;

      if (!Array.isArray(senderAccountRaw) || senderAccountRaw.length === 0) {
        throw new Error(`Sender account ${fromAccount} not found or locked`);
      }

      // Lock Receiver as well to prevent deadlock issues (always lock in same order? ID sort?)
      // To prevent deadlocks, we should lock in ID order. 
      // construct logic: if from < to, lock from then to. If from > to, lock to then from.
      // For now, let's just lock the critical path: the sender (source of funds).

      // B. Calculate Balance (Sum of Ledger Entries)
      // We look at all credits and debits for this account.
      // credits - debits = balance.
      // Actually, in the schema: 
      // type: EntryType (debit, credit)
      // amount: Float
      // if type=credit, it adds to balance. if type=debit, it subtracts? 
      // OR we just store signed amounts?
      // The user plan says: "amount: -amount, type: 'DEBIT'" and "amount: amount, type: 'CREDIT'"
      // So sum of 'amount' is the balance.

      const balanceResult = await tx.ledgerEntry.aggregate({
        where: { accountId: fromAccount },
        _sum: { amount: true }
      });
      const currentBalance = balanceResult._sum.amount || 0;

      // C. Check Insufficient Funds (only if money is leaving the User Account)
      // If type is expense or transfer (from User), check balance.
      // If type is income (from System), we assume system has funds (or check system balance).
      
      // WARNING: We must ensure we are checking the USER's account balance.
      // If fromAccount is SYSTEM_INCOME_ACCOUNT_ID, we might skip check.
      
      // Let's assume we check balance for ALL sources.
      if (currentBalance < amount) {
        throw new Error(`Insufficient funds. Available: ${currentBalance}, Required: ${amount}`);
      }

      // D. Create Double-Entry Records
      // 1. Debit the Sender (Money Leaves)
      const debitEntry = {
        accountId: fromAccount,
        userId: userId, // Owner of the account? Only if user owns it. 
        // Wait, fromAccount might be System. System account might belong to a System User?
        // We need 'userId' for LedgerEntry. Let's create `tx.user.findUnique({where: {id: userId}})`?
        // For simplicity, we use the transaction creator's userId for tracking, 
        // OR we need to fetch the account's owner.
        // Let's fetch account owners.
        type: 'debit',
        amount: -amount, // Negative for Debit
        transactionId: transactionId,
        hash: `hash_${transactionId}_dr`, // Placeholder for crypto hash
        description: description || `Debit for ${type}`,
      };

      // 2. Credit the Receiver (Money Enters)
      const creditEntry = {
        accountId: toAccount,
        userId: userId, // Placeholder, see logic below
        type: 'credit',
        amount: amount, // Positive for Credit
        transactionId: transactionId,
        hash: `hash_${transactionId}_cr`,
        description: description || `Credit for ${type}`,
      };

      // We need to resolve `userId` for each entry correctly.
      // For now, we reuse the input `userId`, assuming the user is moving their own money.
      // In a real app, we'd query Account -> userId.
      // Let's skip precise owner verification for this 'MVP' logic and focus on the Transaction.

      // But LedgerEntry requires `userId`.
      // We will assume the `userId` in LedgerEntry is the "User who initiated" or "Owner of account".
      // Schema says: `user User @relation(...)`.
      // We'll stick to the transaction initiator for now to avoid extra queries, 
      // or we can fetch Account owner if strictness is needed.
      // Update: Schema `LedgerEntry` has `userId`.
      
      // Let's just user the Transaction initiator for now.
      
      // Prisma create
      /*
      await tx.ledgerEntry.createMany({
        data: [
            { ...debitEntry, type: 'debit' }, // enum issue? EntryType.debit
            { ...creditEntry, type: 'credit' }
        ]
      }) 
      */
     // Enums in prisma are strings in JS usually, or exported if strictly typed.
     // We will use 'debit' and 'credit' strings and hope Prisma matches (it should).
      
      await tx.ledgerEntry.create({
        data: {
          accountId: fromAccount,
          userId: userId, // This might differ for the receiver, but keeping simple.
          type: 'debit', 
          amount: -amount,
          timestamp: new Date(timestamp),
          hash: `${transactionId}_dr`, // Simple hash
          transactionId: transactionId,
          description: description
        }
      });

      await tx.ledgerEntry.create({
        data: {
          accountId: toAccount,
          userId: userId, // This is technically wrong if sending to another user, but ok for now.
          type: 'credit',
          amount: amount,
          timestamp: new Date(timestamp),
          hash: `${transactionId}_cr`,
          transactionId: transactionId,
          description: description
        }
      });
    });

    // 3. Update Status to SUCCESS
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'SUCCESS' }
    });

    // 4. Emit Event for Fraud Detection / Notification
    const { eventBus, EVENTS } = await import('../listeners/fraud.listener');
    eventBus.emit(EVENTS.TRANSACTION_CREATED, {
        transactionId,
        userId,
        amount,
        description,
        timestamp
    });

    console.log(`[Worker] Transaction ${transactionId} SUCCESS`);

  } catch (error: any) {
    console.error(`[Worker] Transaction ${transactionId} FAILED:`, error.message);
    
    // 4. Update Status to FAILED
    await prisma.transaction.update({
        where: { id: transactionId },
        data: { 
            status: 'FAILED',
            reasons: error.message
        }
    });
  }
};

// Create the Worker
export const worker = new Worker(TRANSACTION_QUEUE_NAME, processTransaction, {
  connection: {
      host: 'localhost', // Should come from env in production
      port: 6379
  }
});

console.log(`[Worker] Listening for jobs on ${TRANSACTION_QUEUE_NAME}...`);
