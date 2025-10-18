/**
 * Test the enhanced category classification
 * Run with: npx tsx src/scripts/testClassification.ts
 */

import { classifyCategory } from '../ai/fraud';

const testCases = [
  // Entertainment
  { description: 'Netflix subscription', expected: 'entertainment' },
  { description: 'Spotify Premium', expected: 'entertainment' },
  { description: 'Disney+ monthly', expected: 'entertainment' },
  { description: 'Movie tickets', expected: 'entertainment' },
  { description: 'PlayStation store', expected: 'entertainment' },
  
  // Food
  { description: 'Starbucks coffee', expected: 'food' },
  { description: 'McDonalds burger', expected: 'food' },
  { description: 'Restaurant dinner', expected: 'food' },
  { description: 'Grocery shopping', expected: 'food' },
  
  // Transport
  { description: 'Uber ride', expected: 'transport' },
  { description: 'Gas station', expected: 'transport' },
  { description: 'Parking fee', expected: 'transport' },
  
  // Shopping
  { description: 'Amazon order', expected: 'shopping' },
  { description: 'Walmart shopping', expected: 'shopping' },
  
  // Utilities
  { description: 'Internet bill', expected: 'utilities' },
  { description: 'Electricity payment', expected: 'utilities' },
  { description: 'Rent payment', expected: 'utilities' },
  
  // Healthcare
  { description: 'Doctor appointment', expected: 'healthcare' },
  { description: 'Pharmacy medicine', expected: 'healthcare' },
  
  // Education
  { description: 'Udemy course', expected: 'education' },
  { description: 'School tuition', expected: 'education' },
  
  // Fitness
  { description: 'Gym membership', expected: 'fitness' },
  { description: 'Yoga class', expected: 'fitness' },
  
  // Travel
  { description: 'Hotel booking', expected: 'travel' },
  { description: 'Airbnb stay', expected: 'travel' },
  
  // Others
  { description: 'Random payment', expected: 'others' },
  { description: '', expected: 'others' },
];

console.log('🧪 Testing Category Classification\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach(({ description, expected }) => {
  const actual = classifyCategory(description);
  const status = actual === expected ? '✅ PASS' : '❌ FAIL';
  
  if (actual === expected) {
    passed++;
  } else {
    failed++;
  }
  
  const descDisplay = description || '(empty)';
  console.log(`${status} "${descDisplay}"`);
  console.log(`   Expected: ${expected} | Got: ${actual}`);
  
  if (actual !== expected) {
    console.log(`   ⚠️  Classification mismatch!`);
  }
  console.log('');
});

console.log('='.repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log(`⚠️  ${failed} test(s) failed. Review the classification logic.`);
  process.exit(1);
}
