import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

describe('NLP Controller', () => {
  it('should process natural language query', async () => {
    const query = {
      text: 'Show me all transactions above $1000 this month',
    };
    
    const response = await request(app)
      .post('/api/nlp/query')
      .set('Authorization', 'Bearer valid-token')
      .send(query);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('data');
  });

  it('should get query suggestions', async () => {
    const response = await request(app)
      .get('/api/nlp/suggestions')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should handle invalid query gracefully', async () => {
    const query = {
      text: '',
    };
    
    const response = await request(app)
      .post('/api/nlp/query')
      .set('Authorization', 'Bearer valid-token')
      .send(query);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});