import { describe, it, expect } from 'vitest';
import { createTransaction } from '../transactionService';
import { TransactionType } from '../../core/types';

describe('Transaction Service', () => {
  it('should create a transaction successfully', async () => {
    const transactionData = {
      accountId: 'test-account',
      amount: 500,
      type: TransactionType.CREDIT,
      userId: 'test-user',
      debit: null,
      credit: 500,
      from: null,
      to: null,
    };
    const result = await createTransaction(transactionData);

    expect(result).toHaveProperty('id');
    expect(result.accountId).toBe(transactionData.accountId);
    expect(result.amount).toBe(transactionData.amount);
    expect(result.type).toBe(transactionData.type);
  });
});