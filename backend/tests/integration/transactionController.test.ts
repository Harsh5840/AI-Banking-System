import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('Transaction Controller', () => {
  it('should return a list of transactions', async () => {
    const response = await request(app).get('/api/transactions');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new transaction', async () => {
    const transactionData = { accountId: 'test-account', amount: 100, type: 'debit' };
    const response = await request(app).post('/api/transactions').send(transactionData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.accountId).toBe(transactionData.accountId);
    expect(response.body.amount).toBe(transactionData.amount);
    expect(response.body.type).toBe(transactionData.type);
  });
});