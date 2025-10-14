const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5050/v1';

async function testAuth() {
  console.log('🔐 Testing authentication endpoints...\n');
  
  try {
    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@jaydenmetz.com',
      password: 'AdminPassword123!'
    });
    
    console.log('✅ Login successful!');
    console.log('   Token:', loginResponse.data.data.token.substring(0, 50) + '...');
    console.log('   User:', loginResponse.data.data.user.email);
    
    const token = loginResponse.data.data.token;
    
    // Test profile endpoint
    console.log('\n2. Testing profile endpoint...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully!');
    console.log('   Name:', profileResponse.data.data.firstName, profileResponse.data.data.lastName);
    console.log('   Role:', profileResponse.data.data.role);
    
    // Test protected endpoint
    console.log('\n3. Testing protected endpoint (escrows)...');
    const escrowsResponse = await axios.get(`${API_URL}/escrows`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Protected endpoint accessible!');
    console.log('   Total escrows:', escrowsResponse.data.data.pagination.total);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAuth();