import { LedgerEntry } from "./types";
import crypto from "crypto";

// Re-export types for convenience
export { LedgerEntry } from "./types";

export interface Transaction {
  debit: LedgerEntry;
  credit: LedgerEntry;
  userId: string;
  from: string;
  to: string;
  amount: number;
  timestamp?: string;
  prevHash?: string;
  debitCategory?: string;
  creditCategory?: string;
  description?: string;
  reasons?: string;
  parentId?: string | null;
}

export class Ledger {
  private entries: LedgerEntry[] = [];

  addEntry(entry: LedgerEntry) {
    this.entries.push(entry);
  }

  getEntries(): LedgerEntry[] {
    return this.entries;
  }

  getBalance(account: string): number {
    return this.entries
      .filter((e) => e.account === account)
      .reduce((sum, e) => sum + e.amount, 0);
  }
}

/**
 * Create a transaction with debit and credit ledger entries
 */
export function createTransaction(params: {
  userId: string;
  from: string;
  to: string;
  amount: number;
  timestamp?: string;
  prevHash?: string;
  debitCategory?: string;
  creditCategory?: string;
  description?: string;
}): Transaction {
  const timestamp = params.timestamp || new Date().toISOString();
  const prevHash = params.prevHash || "";

  const debitData = {
    userId: params.userId,
    account: params.from,
    amount: params.amount,
    category: params.debitCategory || "others",
    timestamp,
    prevHash,
  };

  const creditData = {
    userId: params.userId,
    account: params.to,
    amount: params.amount,
    category: params.creditCategory || "others",
    timestamp,
    prevHash,
  };

  const debitHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(debitData))
    .digest("hex");

  const creditHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(creditData))
    .digest("hex");

  const debit: LedgerEntry = {
    id: crypto.randomUUID(),
    ...debitData,
    hash: debitHash,
  };

  const credit: LedgerEntry = {
    id: crypto.randomUUID(),
    ...creditData,
    hash: creditHash,
  };

  return {
    debit,
    credit,
    userId: params.userId,
    from: params.from,
    to: params.to,
    amount: params.amount,
    timestamp,
    prevHash,
    debitCategory: params.debitCategory,
    creditCategory: params.creditCategory,
    description: params.description,
  };
}