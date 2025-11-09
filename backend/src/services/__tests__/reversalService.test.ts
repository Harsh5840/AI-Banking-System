import { describe, it, expect } from 'vitest';
import { reverseTransaction, validateReversal } from '../reversalService';

describe('Reversal Service', () => {
  it('should reverse a transaction successfully', async () => {
    const transactionId = 'test-transaction-id';
    const userId = 'test-user';
    
    const result = await reverseTransaction(transactionId, userId);
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('reversedTransactionId');
    expect(result.reversedTransactionId).toBe(transactionId);
  });

  it('should validate reversal eligibility', async () => {
    const transaction = {
      id: 'test-transaction',
      amount: 500,
      createdAt: new Date(),
      isReversed: false,
    };
    
    const result = validateReversal(transaction);
    
    expect(result.isEligible).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('should reject reversal for already reversed transaction', async () => {
    const transaction = {
      id: 'test-transaction',
      amount: 500,
      createdAt: new Date(),
      isReversed: true,
    };
    
    const result = validateReversal(transaction);
    
    expect(result.isEligible).toBe(false);
    expect(result.reason).toContain('already reversed');
  });
});