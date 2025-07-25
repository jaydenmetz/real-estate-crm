#!/usr/bin/env node

/**
 * Script to test authentication on Railway deployment
 * Usage: node test-railway-auth.js
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'https://api.jaydenmetz.com';
const TEST_USERNAME = 'admin@jaydenmetz.com';
const TEST_PASSWORD = 'admin123';

console.log('🔍 Testing Railway Authentication...\n');
console.log(`API URL: ${API_URL}`);
console.log(`Testing with user: ${TEST_USERNAME}\n`);

async function testAuth() {
  try {
    // 1. Test if API is accessible
    console.log('1️⃣ Testing API accessibility...');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/v1/auth/test`);
      console.log('✅ API is accessible');
      console.log(`   Database: ${healthResponse.data.data.database}`);
      console.log(`   JWT Secret: ${healthResponse.data.data.jwtSecret}`);
      console.log(`   Node Env: ${healthResponse.data.data.nodeEnv}`);
      console.log(`   Admin User Found: ${healthResponse.data.data.adminUser.found}\n`);
    } catch (error) {
      console.log('❌ API test endpoint failed:', error.message);
    }

    // 2. Test login
    console.log('2️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const user = loginResponse.data.data.user;
      console.log(`   User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || 'undefined'}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}\n`);

      const token = loginResponse.data.data.token;
      console.log(`   Token: ${token.substring(0, 50)}...\n`);

      // 3. Test token verification
      console.log('3️⃣ Testing token verification...');
      const verifyResponse = await axios.get(`${API_URL}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (verifyResponse.data.success) {
        console.log('✅ Token verification successful');
        const verifiedUser = verifyResponse.data.data.user;
        console.log(`   Username in verify response: ${verifiedUser.username || 'undefined'}\n`);
      }

      // 4. Test public profile access
      console.log('4️⃣ Testing public profile access...');
      const profileUsername = user.username || 'admin';
      const profileResponse = await axios.get(`${API_URL}/api/v1/profiles/public/${profileUsername}`);
      
      if (profileResponse.data.success) {
        console.log('✅ Public profile accessible');
        console.log(`   Profile URL: ${API_URL}/api/v1/profiles/public/${profileUsername}`);
        console.log(`   Display Name: ${profileResponse.data.data.displayName || 'Not set'}`);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data.error);
    }

  } catch (error) {
    console.log('\n❌ Error during testing:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    } else {
      console.log(`   Message: ${error.message}`);
    }
  }
}

// Run the test
testAuth().then(() => {
  console.log('\n✨ Test completed');
}).catch((error) => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});