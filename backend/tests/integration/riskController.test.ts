import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('Risk Controller', () => {
  it('should calculate risk score for transaction', async () => {
    const transactionData = {
      amount: 10000,
      accountId: 'test-account',
    };
    
    const response = await request(app)
      .post('/api/risk/calculate')
      .set('Authorization', 'Bearer valid-token')
      .send(transactionData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('riskScore');
    expect(response.body.riskScore).toBeGreaterThanOrEqual(0);
    expect(response.body.riskScore).toBeLessThanOrEqual(100);
  });

  it('should get risk assessment history', async () => {
    const response = await request(app)
      .get('/api/risk/history')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get risk thresholds', async () => {
    const response = await request(app)
      .get('/api/risk/thresholds')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('low');
    expect(response.body).toHaveProperty('medium');
    expect(response.body).toHaveProperty('high');
  });

  it('should update risk thresholds (admin only)', async () => {
    const newThresholds = {
      low: 30,
      medium: 60,
      high: 90,
    };
    
    const response = await request(app)
      .put('/api/risk/thresholds')
      .set('Authorization', 'Bearer admin-token')
      .send(newThresholds);
    
    expect(response.status).toBe(200);
    expect(response.body.low).toBe(newThresholds.low);
  });
});