import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('User Controller', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      name: 'New User',
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
  });

  it('should login existing user', async () => {
    const credentials = {
      email: 'demo@ledgerx.com',
      password: 'demo123',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
  });

  it('should update user profile', async () => {
    const updateData = { name: 'Updated Name' };
    
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', 'Bearer valid-token')
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updateData.name);
  });
});