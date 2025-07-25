const axios = require('axios');

async function testLogin() {
  console.log('Testing production login...\n');
  
  const credentials = {
    username: 'admin@jaydenmetz.com',
    password: 'AdminPassword123!'
  };
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('https://api.jaydenmetz.com/health');
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test auth test endpoint
    console.log('\n2. Testing auth test endpoint...');
    const testResponse = await axios.get('https://api.jaydenmetz.com/v1/auth/test');
    console.log('✅ Auth test passed:', testResponse.data.data);
    
    // Test direct login
    console.log('\n3. Testing direct login endpoint...');
    try {
      const directResponse = await axios.post('https://api.jaydenmetz.com/direct-login', credentials);
      console.log('✅ Direct login response:', directResponse.data);
    } catch (error) {
      console.log('❌ Direct login failed:', error.response?.data || error.message);
    }
    
    // Test main login
    console.log('\n4. Testing main login endpoint...');
    try {
      const loginResponse = await axios.post('https://api.jaydenmetz.com/v1/auth/login', credentials);
      console.log('✅ Main login response:', loginResponse.data);
    } catch (error) {
      console.log('❌ Main login failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLogin();