import { LedgerEntry } from "./types";

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