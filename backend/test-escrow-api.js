// Test script for escrow API endpoint
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5050/api/v1';

async function testEscrowAPI() {
  console.log('Testing Escrow API endpoints...\n');

  // Test 1: GET all escrows
  console.log('1. Testing GET /escrows');
  try {
    const response = await fetch(`${API_URL}/escrows`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ GET /escrows working\n');
  } catch (error) {
    console.error('❌ GET /escrows failed:', error.message, '\n');
  }

  // Test 2: POST create new escrow
  console.log('2. Testing POST /escrows');
  const newEscrow = {
    propertyAddress: '456 Test Street, San Diego, CA 92101',
    purchasePrice: 750000,
    buyers: [{ name: 'Test Buyer', email: 'buyer@test.com', phone: '555-1234' }],
    sellers: [{ name: 'Test Seller', email: 'seller@test.com', phone: '555-5678' }],
    acceptanceDate: new Date().toISOString(),
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    propertyType: 'Single Family',
    commissionPercentage: 2.5,
    earnestMoneyDeposit: 7500,
    downPayment: 150000,
    loanAmount: 600000
  };

  try {
    const response = await fetch(`${API_URL}/escrows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newEscrow)
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ POST /escrows working\n');
      
      // Test 3: GET the created escrow by ID
      if (data.data && data.data.id) {
        console.log('3. Testing GET /escrows/:id');
        const getResponse = await fetch(`${API_URL}/escrows/${data.data.id}`);
        const getData = await getResponse.json();
        console.log('Status:', getResponse.status);
        console.log('Response:', JSON.stringify(getData, null, 2));
        console.log('✅ GET /escrows/:id working\n');
      }
    } else {
      console.log('❌ POST /escrows returned error\n');
    }
  } catch (error) {
    console.error('❌ POST /escrows failed:', error.message, '\n');
  }

  console.log('API testing complete!');
}

// Check if node-fetch is installed
try {
  require.resolve('node-fetch');
  testEscrowAPI();
} catch (e) {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
  console.log('node-fetch installed. Please run this script again.');
}