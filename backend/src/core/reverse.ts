import { LedgerEntry } from "./types";

export function reverseEntry(entry: LedgerEntry): LedgerEntry {
  return {
    ...entry,
    amount: -entry.amount,
    isReversal: true,
    timestamp: new Date().toISOString(),
  };
}