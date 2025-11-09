import { describe, it, expect } from 'vitest';
import { detectFraud, analyzeTransactionPattern } from '../fraudService';

describe('Fraud Service', () => {
  it('should detect fraudulent transaction based on amount threshold', async () => {
    const transaction = {
      amount: 50000,
      userId: 'test-user',
      accountId: 'test-account',
    };
    
    const result = await detectFraud(transaction);
    
    expect(result).toHaveProperty('isFraudulent');
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should not flag normal transaction as fraud', async () => {
    const transaction = {
      amount: 100,
      userId: 'test-user',
      accountId: 'test-account',
    };
    
    const result = await detectFraud(transaction);
    
    expect(result.isFraudulent).toBe(false);
    expect(result.riskScore).toBeLessThan(50);
  });

  it('should analyze transaction patterns correctly', async () => {
    const transactions = [
      { amount: 100, timestamp: new Date() },
      { amount: 200, timestamp: new Date() },
      { amount: 150, timestamp: new Date() },
    ];
    
    const result = await analyzeTransactionPattern(transactions);
    
    expect(result).toHaveProperty('averageAmount');
    expect(result).toHaveProperty('frequency');
  });
});