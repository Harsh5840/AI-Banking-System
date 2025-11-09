import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('Reversal Controller', () => {
  it('should create a reversal request', async () => {
    const reversalData = {
      transactionId: 'test-transaction-id',
      reason: 'Customer request',
    };
    
    const response = await request(app)
      .post('/api/reversals')
      .set('Authorization', 'Bearer valid-token')
      .send(reversalData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status');
  });

  it('should get reversal history', async () => {
    const response = await request(app)
      .get('/api/reversals')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should approve a reversal request', async () => {
    const response = await request(app)
      .put('/api/reversals/test-reversal-id/approve')
      .set('Authorization', 'Bearer admin-token');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('approved');
  });

  it('should reject a reversal request', async () => {
    const response = await request(app)
      .put('/api/reversals/test-reversal-id/reject')
      .set('Authorization', 'Bearer admin-token')
      .send({ reason: 'Invalid request' });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('rejected');
  });
});