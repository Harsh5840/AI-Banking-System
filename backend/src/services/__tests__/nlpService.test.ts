import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageQuery, executeNLPQuery } from '../nlpService';

describe('NLP Service', () => {
  it('should parse natural language query for transactions', async () => {
    const query = 'Show me all transactions above $1000 this month';
    
    const result = await parseNaturalLanguageQuery(query);
    
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('filters');
    expect(result.intent).toBe('search_transactions');
  });

  it('should execute NLP query and return results', async () => {
    const query = 'What is my account balance?';
    const userId = 'test-user';
    
    const result = await executeNLPQuery(query, userId);
    
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('data');
  });

  it('should handle invalid queries gracefully', async () => {
    const query = 'asdfghjkl random text';
    
    const result = await parseNaturalLanguageQuery(query);
    
    expect(result).toHaveProperty('error');
    expect(result.intent).toBe('unknown');
  });
});