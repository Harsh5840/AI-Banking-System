import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('Analytics Controller', () => {
  it('should get transaction analytics', async () => {
    const response = await request(app)
      .get('/api/analytics/transactions')
      .set('Authorization', 'Bearer valid-token')
      .query({ startDate: '2025-01-01', endDate: '2025-12-31' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalTransactions');
    expect(response.body).toHaveProperty('totalAmount');
  });

  it('should get account analytics', async () => {
    const response = await request(app)
      .get('/api/analytics/accounts')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get risk analytics', async () => {
    const response = await request(app)
      .get('/api/analytics/risk')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('riskScore');
    expect(response.body).toHaveProperty('flaggedTransactions');
  });

  it('should get dashboard summary', async () => {
    const response = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalAccounts');
    expect(response.body).toHaveProperty('totalTransactions');
    expect(response.body).toHaveProperty('totalBalance');
  });
});