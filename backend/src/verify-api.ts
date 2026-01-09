import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function verify() {
  try {
    // 1. Login as Alice
    console.log('🔑 Logging in as Alice...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'alice@techcorp.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful. Token obtained.');

    // 2. Fetch Department Budget
    console.log('📊 Fetching Department Budget...');
    const budgetRes = await axios.get(`${API_URL}/transactions/department-budget`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Department Budget Response:');
    console.log(JSON.stringify(budgetRes.data, null, 2));

    if (budgetRes.data.departmentName === 'Engineering' && budgetRes.data.budgetLimit === 50000) {
      console.log('🎉 Verification PASSED!');
    } else {
      console.error('❌ Verification FAILED: Unexpected data');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Verification FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

verify();
