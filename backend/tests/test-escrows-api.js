// Simple test script for escrows API
const axios = require('axios');

const API_BASE = 'http://localhost:3000/v1';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test-token'; // Replace with actual token

// Test data
const testEscrow = {
  propertyAddress: '789 Oak Avenue, San Francisco, CA 94110',
  purchasePrice: 1200000,
  earnestMoneyDeposit: 12000,
  downPayment: 240000,
  commissionPercentage: 2.5,
  acceptanceDate: '2025-01-17',
  closingDate: '2025-03-15',
  propertyType: 'Condo',
  leadSource: 'Referral',
  buyers: [
    { name: 'Test Buyer', email: 'buyer@test.com', phone: '555-1111' }
  ],
  sellers: [
    { name: 'Test Seller', email: 'seller@test.com', phone: '555-2222' }
  ]
};

const axiosConfig = {
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

async function runTests() {
  console.log('🚀 Starting Escrows API Tests...\n');
  
  let createdEscrowId;

  try {
    // Test 1: Create Escrow
    console.log('📝 Test 1: Creating new escrow...');
    const createResponse = await axios.post(`${API_BASE}/escrows`, testEscrow, axiosConfig);
    
    if (createResponse.data.success) {
      createdEscrowId = createResponse.data.data.id;
      console.log(`✅ Escrow created successfully! ID: ${createdEscrowId}`);
      console.log(`   Property: ${createResponse.data.data.property_address}`);
      console.log(`   Price: $${createResponse.data.data.purchase_price.toLocaleString()}\n`);
    } else {
      throw new Error('Failed to create escrow');
    }

    // Test 2: Get All Escrows
    console.log('📋 Test 2: Fetching all escrows...');
    const listResponse = await axios.get(`${API_BASE}/escrows?page=1&limit=5`, axiosConfig);
    
    if (listResponse.data.success) {
      console.log(`✅ Found ${listResponse.data.data.pagination.total} total escrows`);
      console.log(`   Showing ${listResponse.data.data.escrows.length} on page 1\n`);
    }

    // Test 3: Get Single Escrow
    console.log('🔍 Test 3: Fetching single escrow...');
    const getResponse = await axios.get(`${API_BASE}/escrows/${createdEscrowId}`, axiosConfig);
    
    if (getResponse.data.success) {
      const escrow = getResponse.data.data;
      console.log(`✅ Retrieved escrow ${escrow.id}`);
      console.log(`   Buyers: ${escrow.buyers.map(b => b.name).join(', ')}`);
      console.log(`   Sellers: ${escrow.sellers.map(s => s.name).join(', ')}`);
      console.log(`   Documents: ${escrow.documents.length}`);
      console.log(`   Notes: ${escrow.notes.length}\n`);
    }

    // Test 4: Update Escrow
    console.log('✏️  Test 4: Updating escrow...');
    const updateData = {
      purchasePrice: 1250000,
      escrowStatus: 'Pending'
    };
    const updateResponse = await axios.put(
      `${API_BASE}/escrows/${createdEscrowId}`, 
      updateData, 
      axiosConfig
    );
    
    if (updateResponse.data.success) {
      console.log(`✅ Escrow updated successfully`);
      console.log(`   New price: $${updateResponse.data.data.purchase_price.toLocaleString()}`);
      console.log(`   New status: ${updateResponse.data.data.escrow_status}\n`);
    }

    // Test 5: Add Note
    console.log('📝 Test 5: Adding note to escrow...');
    const noteData = {
      content: 'Inspection completed - minor repairs needed',
      isPrivate: false
    };
    const noteResponse = await axios.post(
      `${API_BASE}/escrows/${createdEscrowId}/notes`,
      noteData,
      axiosConfig
    );
    
    if (noteResponse.data.success) {
      console.log(`✅ Note added successfully`);
      console.log(`   Content: "${noteResponse.data.data.content}"\n`);
    }

    // Test 6: Add Document
    console.log('📄 Test 6: Adding document reference...');
    const docData = {
      fileName: 'inspection-report.pdf',
      filePath: '/documents/escrows/inspection-report.pdf',
      fileSize: 2048000,
      mimeType: 'application/pdf',
      documentType: 'Inspection Report'
    };
    const docResponse = await axios.post(
      `${API_BASE}/escrows/${createdEscrowId}/documents`,
      docData,
      axiosConfig
    );
    
    if (docResponse.data.success) {
      console.log(`✅ Document reference added`);
      console.log(`   File: ${docResponse.data.data.file_name}`);
      console.log(`   Type: ${docResponse.data.data.document_type}\n`);
    }

    // Test 7: Get Statistics
    console.log('📊 Test 7: Fetching dashboard statistics...');
    const statsResponse = await axios.get(`${API_BASE}/escrows/stats/dashboard`, axiosConfig);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log(`✅ Statistics retrieved`);
      console.log(`   Active escrows: ${stats.summary.totalActiveEscrows}`);
      console.log(`   Active value: $${(stats.summary.totalActiveValue || 0).toLocaleString()}`);
      console.log(`   Status breakdown:`);
      stats.byStatus.forEach(s => {
        console.log(`     - ${s.escrow_status}: ${s.count} ($${(s.total_value || 0).toLocaleString()})`);
      });
      console.log('');
    }

    // Test 8: Delete Escrow
    console.log('🗑️  Test 8: Soft deleting escrow...');
    const deleteResponse = await axios.delete(
      `${API_BASE}/escrows/${createdEscrowId}`,
      axiosConfig
    );
    
    if (deleteResponse.data.success) {
      console.log(`✅ Escrow soft deleted successfully\n`);
    }

    // Verify deletion
    console.log('🔍 Verifying soft delete...');
    try {
      await axios.get(`${API_BASE}/escrows/${createdEscrowId}`, axiosConfig);
      console.log('❌ Escrow still accessible (should be 404)');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Escrow correctly returns 404 after deletion\n');
      }
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    // Cleanup if needed
    if (createdEscrowId) {
      try {
        await axios.delete(`${API_BASE}/escrows/${createdEscrowId}`, axiosConfig);
        console.log('🧹 Cleaned up test data');
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }
}

// Run tests
runTests().catch(console.error);