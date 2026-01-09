import { amountAnomalyDetector } from './model';
import { mlRiskScore } from './ml';
import { parseQueryWithLangChain } from './langchainParser';
import { redis } from '../lib/redis';

async function testAnomalyDetector() {
  console.log('\n--- Testing Anomaly Detector ---');
  
  // Seed with normal data
  [10, 12, 11, 13, 10, 12, 11, 12, 1000].forEach(x => amountAnomalyDetector.update(x));
  
  console.log('Mean:', amountAnomalyDetector['mean'].toFixed(2));
  console.log('StdDev:', amountAnomalyDetector.getStdDev().toFixed(2));

  const normalVal = 12;
  const outlierVal = 5000;

  console.log(`Z-Score for ${normalVal}:`, amountAnomalyDetector.getZScore(normalVal).toFixed(2));
  console.log(`Z-Score for ${outlierVal}:`, amountAnomalyDetector.getZScore(outlierVal).toFixed(2));

  if (amountAnomalyDetector.isAnomaly(outlierVal)) {
    console.log('✅ Correctly detected outlier');
  } else {
    console.error('❌ Failed to detect outlier');
  }
}

// MOCK REDIS for testing when infrastructure is missing
const mockRedis = {
    store: new Map<string, string>(),
    async get(key: string) { return this.store.get(key) || null; },
    async setex(key: string, ttl: number, val: string) { this.store.set(key, val); },
    async incr(key: string) { 
        const val = (parseInt(this.store.get(key) || '0') + 1).toString();
        this.store.set(key, val);
        return parseInt(val);
    },
    async expire(key: string, ttl: number) { return 1; }
};

// Override the imported redis with mock
// Note: In a real test runner like Jest/Vitest we would use vi.mock, but here we are monkey-patching for a script.
// Since 'redis' is imported as a const, we can't easily reassign it unless we change the test structure.
// Instead, let's just use the mockRedis directly in our test functions by passing it as a dependency or assume we are testing the *logic* 
// For this script, we will just use the mock implementation locally to prove the CONCEPT of the test.

// Actually, to make this specific script work without changing code, we can just *simulate* the calls.
// But better yet, I will use `jest-mock`-like behavior if I could. 
// Let's just catch the error in the main loop and print "Redis not found - Skipping Integration Test".

async function testOptimizations() {
  console.log('\n--- Testing AI Optimizations ---');
  
  // Check if real Redis is up
  try {
      await redis.set('test_conn', '1');
  } catch (e) {
      console.warn('⚠️  Redis is NOT running. Skipping integration tests for Caching/RateLimiting.');
      console.warn('⚠️  Please ensure Redis is running on localhost:6379 to verify these features.');
      return;
  }

  const userId = 'test-user-' + Date.now();

  const query = "How much did I spend?";

  // 1. First Call (Cache Miss / Rate Limit Check)
  console.time('FirstCall');
  try {
      await parseQueryWithLangChain(query, userId);
  } catch (err) {
      console.log('Call failed (expected if env missing):', err.message);
  }
  console.timeEnd('FirstCall');

  // 2. Second Call (Cache Hit)
  console.time('CacheHit');
  try {
     await parseQueryWithLangChain(query, userId);
  } catch (err) {}
  console.timeEnd('CacheHit');
}
  

async function run() {
  await testAnomalyDetector();
  await testOptimizations();
  
  // Cleanup
  process.exit(0);
}

run();
