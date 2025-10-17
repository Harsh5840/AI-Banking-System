/**
 * Test transaction creation with system accounts
 * Run with: npx tsx src/scripts/testTransaction.ts <JWT_TOKEN>
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testTransaction() {
  const token = process.argv[2];
  
  if (!token) {
    console.error('❌ Please provide a JWT token as an argument');
    console.log('Usage: npx tsx src/scripts/testTransaction.ts <JWT_TOKEN>');
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Get user's accounts
    console.log('📋 Fetching user accounts...\n');
    const accountsResponse = await axios.get(`${BASE_URL}/accounts/me`, { headers });
    const accounts = accountsResponse.data;
    
    if (accounts.length === 0) {
      console.error('❌ No accounts found. Please create an account first.');
      process.exit(1);
    }

    console.log('✅ Found accounts:');
    accounts.forEach((acc: any) => {
      console.log(`   - ${acc.name} (${acc.type}): ${acc.id}`);
    });
    console.log('');

    const testAccount = accounts[0].id;

    // 2. Test expense transaction
    console.log('💸 Testing EXPENSE transaction...');
    const expenseResponse = await axios.post(
      `${BASE_URL}/transactions/create`,
      {
        type: 'expense',
        from: testAccount,
        amount: 50,
        description: 'Test expense - Coffee'
      },
      { headers }
    );
    console.log('✅ Expense created:', expenseResponse.data.message);
    console.log('');

    // 3. Test income transaction
    console.log('💰 Testing INCOME transaction...');
    const incomeResponse = await axios.post(
      `${BASE_URL}/transactions/create`,
      {
        type: 'income',
        to: testAccount,
        amount: 1000,
        description: 'Test income - Salary'
      },
      { headers }
    );
    console.log('✅ Income created:', incomeResponse.data.message);
    console.log('');

    // 4. Test transfer if multiple accounts exist
    if (accounts.length >= 2) {
      console.log('🔄 Testing TRANSFER transaction...');
      const transferResponse = await axios.post(
        `${BASE_URL}/transactions/create`,
        {
          type: 'transfer',
          from: accounts[0].id,
          to: accounts[1].id,
          amount: 100,
          description: 'Test transfer between accounts'
        },
        { headers }
      );
      console.log('✅ Transfer created:', transferResponse.data.message);
      console.log('');
    }

    console.log('🎉 All tests passed successfully!\n');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testTransaction();
