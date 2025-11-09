import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/server';

describe('Account Controller', () => {
  it('should return a list of accounts', async () => {
    const response = await request(app).get('/api/accounts');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new account', async () => {
    const accountData = { name: 'New Account', balance: 500 };
    const response = await request(app).post('/api/accounts').send(accountData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(accountData.name);
    expect(response.body.balance).toBe(accountData.balance);
  });
});