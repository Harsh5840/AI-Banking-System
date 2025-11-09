import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('Fraud Controller', () => {
  it('should analyze transaction for fraud', async () => {
    const transactionData = {
      amount: 50000,
      accountId: 'test-account',
      userId: 'test-user',
    };
    
    const response = await request(app)
      .post('/api/fraud/analyze')
      .set('Authorization', 'Bearer valid-token')
      .send(transactionData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('riskScore');
    expect(response.body).toHaveProperty('isFraudulent');
  });

  it('should get fraud detection history', async () => {
    const response = await request(app)
      .get('/api/fraud/history')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get fraud statistics', async () => {
    const response = await request(app)
      .get('/api/fraud/statistics')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalFlagged');
    expect(response.body).toHaveProperty('averageRiskScore');
  });
});