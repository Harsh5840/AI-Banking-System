export interface LedgerEntry {
  id: string;
  account: string;
  amount: number;
  category?: string;
  timestamp: string;
  isReversal?: boolean;
  [key: string]: any;
}