export interface LedgerEntry {
  id: string;
  account: string;
  amount: number;
  category?: string;
  timestamp: string;
  isReversal?: boolean;
  [key: string]: any;
}

export enum AccountType {
  SAVINGS = 'savings',
  CHECKING = 'checking',
  BUSINESS = 'business',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}