import { prisma } from "./client";
import { EntryType, Prisma } from "@prisma/client";
// import { Transaction as LedgerXTransaction } from "../core/ledger";
import { randomUUID } from "crypto";

// Adapted for standalone backend, remove monorepo-specific imports

export async function addTransactionFromCore(transaction: any /* LedgerXTransaction & { reasons?: string; parentId?: string | null; } */) {
  const { debit, credit } = transaction;

  const existing = await prisma.ledgerEntry.findUnique({
    where: { hash: debit.hash },
  });
  if (existing) throw new Error(`Duplicate ledger hash: ${debit.hash}`);

  const txData: Prisma.TransactionCreateInput = {
    user: { connect: { id: debit.userId } },
    amount: debit.amount,
    category: debit.category ?? "others",
    timestamp: new Date(debit.timestamp),
    riskScore: debit.riskScore ?? 0,
    isFlagged: debit.isSuspicious ?? false,
    reasons: transaction.reasons ?? "",
    ledgerEntries: {
      create: [
        {
          id: debit.id,
          userId: debit.userId,
          accountId: debit.account,
          type: EntryType.debit,
          amount: debit.amount,
          category: debit.category,
          timestamp: new Date(debit.timestamp),
          prevHash: debit.prevHash || "",
          hash: debit.hash,
        },
        {
          id: credit.id,
          userId: credit.userId,
          accountId: credit.account,
          type: EntryType.credit,
          amount: credit.amount,
          category: credit.category,
          timestamp: new Date(credit.timestamp),
          prevHash: credit.prevHash || "",
          hash: credit.hash,
        },
      ],
    },
  };

  if (transaction.parentId) {
    txData.parent = { connect: { id: transaction.parentId } };
  }

  const created = await prisma.transaction.create({ data: txData });

  return prisma.transaction.findUnique({
    where: { id: created.id },
    include: { ledgerEntries: true },
  });
}

export async function reverseTransaction(transactionId: string) {
  const original = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { ledgerEntries: true },
  });

  if (!original) throw new Error("Transaction not found");

  const reversedTx = await prisma.transaction.create({
    data: {
      user: { connect: { id: original.userId } },
      amount: -original.amount,
      category: original.category,
      timestamp: new Date(),
      riskScore: 0,
      isFlagged: false,
      reasons: "Reversal",
      parent: { connect: { id: original.id } },
    },
  });

  const reversedEntries = original.ledgerEntries.map((entry: any) => ({
    account: { connect: { id: entry.accountId } },
    user: { connect: { id: entry.userId } },
    type: entry.type === EntryType.debit ? EntryType.credit : EntryType.debit,
    amount: entry.amount,
    timestamp: new Date(),
    hash: `rev-${entry.hash}-${randomUUID()}`,
    prevHash: entry.hash,
    isReversal: true,
    originalHash: entry.hash,
    category: entry.category,
    flagged: false,
    riskScore: 0,
    transaction: { connect: { id: reversedTx.id } },
  }));

  await prisma.$transaction(
    reversedEntries.map((data: any) => prisma.ledgerEntry.create({ data }))
  );

  return prisma.transaction.findUnique({
    where: { id: reversedTx.id },
    include: { ledgerEntries: true },
  });
}

export async function getAllTransactions(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    include: {
      ledgerEntries: true,
    },
  });

  return transactions.map((txn: any) => {
    const debit = txn.ledgerEntries.find((e: any) => e.type === "debit");
    const credit = txn.ledgerEntries.find((e: any) => e.type === "credit");

    let reasons: string[] = [];
    if (txn.reasons && txn.reasons.trim() !== "") {
      try {
        const parsed = JSON.parse(txn.reasons);
        reasons = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        reasons = [txn.reasons];
      }
    }

    return {
      ...txn,
      debit,
      credit,
      reasons,
    };
  });
}
