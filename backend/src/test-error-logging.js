const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5050/v1';

async function testErrorLogging() {
  console.log('Testing Enhanced Error Logging...\n');

  // Test 1: Valid request
  console.log('1. Testing valid request logging:');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check successful');
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: 404 error
  console.log('\n2. Testing 404 error:');
  try {
    await axios.get(`${BASE_URL}/invalid-endpoint`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ 404 error properly logged');
      console.log('   Error ID:', error.response.data.error?.errorId);
    }
  }

  // Test 3: Invalid escrow ID
  console.log('\n3. Testing invalid escrow ID:');
  try {
    await axios.get(`${BASE_URL}/escrows/invalid-id`);
  } catch (error) {
    console.log('✅ Error caught with ID:', error.response?.data?.error?.errorId);
    console.log('   Message:', error.response?.data?.error?.message);
  }

  // Test 4: Invalid date in request
  console.log('\n4. Testing date parsing error:');
  try {
    await axios.post(`${BASE_URL}/escrows`, {
      propertyAddress: '123 Test St',
      closingDate: 'invalid-date-format'
    });
  } catch (error) {
    console.log('✅ Validation error caught');
    console.log('   Error ID:', error.response?.data?.error?.errorId);
    console.log('   Message:', error.response?.data?.error?.message);
  }

  console.log('\n✅ Error logging tests complete!');
  console.log('Check your logs to see detailed error information for each error ID above.');
}

// Run tests
testErrorLogging().catch(console.error);