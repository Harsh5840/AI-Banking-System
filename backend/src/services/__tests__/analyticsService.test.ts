import { describe, it, expect } from 'vitest';
import { 
  getTransactionAnalytics, 
  getRiskAnalytics, 
  getAccountAnalytics 
} from '../analyticsService';

describe('Analytics Service', () => {
  it('should return transaction analytics', async () => {
    const userId = 'test-user';
    const dateRange = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    };
    
    const result = await getTransactionAnalytics(userId, dateRange);
    
    expect(result).toHaveProperty('totalTransactions');
    expect(result).toHaveProperty('totalAmount');
    expect(result).toHaveProperty('averageAmount');
  });

  it('should return risk analytics', async () => {
    const userId = 'test-user';
    
    const result = await getRiskAnalytics(userId);
    
    expect(result).toHaveProperty('riskScore');
    expect(result).toHaveProperty('flaggedTransactions');
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it('should return account analytics', async () => {
    const accountId = 'test-account';
    
    const result = await getAccountAnalytics(accountId);
    
    expect(result).toHaveProperty('balance');
    expect(result).toHaveProperty('transactionCount');
    expect(result).toHaveProperty('lastActivity');
  });
});