/**
 * Test script for Google Gemini AI-powered query parser
 * Run with: npx tsx src/ai/test-langchain.ts
 */

import { parseQueryWithLLM } from './langchainParser';

const testQueries = [
  "How much did I spend on food last month?",
  "Show me my top 5 expenses this month",
  "What are my transactions in September?",
  "How much did I spend on restaurants?",
  "List my entertainment expenses",
  "What's my total spending this year?",
  "Show me high-value transactions over $1000",
  "What did I spend on transport last week?",
];

async function runTests() {
  console.log('🧪 Testing Google Gemini AI Query Parser\n');
  console.log('=' .repeat(60));

  for (const query of testQueries) {
    console.log(`\n📝 Query: "${query}"`);
    
    try {
      const result = await parseQueryWithLLM(query);
      
      console.log('✅ Result:');
      console.log(`   Intent: ${result.intent}`);
      console.log(`   Filters: ${JSON.stringify(result.filters)}`);
      console.log(`   Limit: ${result.limit}`);
      
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
    }
    
    console.log('-'.repeat(60));
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
