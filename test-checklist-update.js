const fetch = require('node-fetch');

async function testChecklistUpdate() {
  const API_BASE = 'http://localhost:5050/v1';
  
  try {
    // First get an escrow to see its current structure
    const getResponse = await fetch(`${API_BASE}/escrows`);
    const escrows = await getResponse.json();
    
    if (escrows.data && escrows.data.length > 0) {
      const escrow = escrows.data[0];
      console.log('Current escrow ID:', escrow.id);
      console.log('Current checklists:', JSON.stringify(escrow.checklists, null, 2));
      
      // Test updating a checklist item
      const updateData = {
        checklists: JSON.stringify({
          loan: {
            le: true,
            lockedRate: false,
            appraisalOrdered: true,
            clearToClose: false
          },
          house: {
            emd: true,
            homeInspectionOrdered: true,
            sellerDisclosures: false
          },
          admin: {
            mlsStatusUpdate: true,
            tcEmail: false
          }
        })
      };
      
      console.log('\nSending update:', updateData);
      
      const updateResponse = await fetch(`${API_BASE}/escrows/${escrow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await updateResponse.json();
      console.log('\nUpdate response:', result.success ? 'Success' : 'Failed');
      if (result.data) {
        console.log('Updated checklists:', JSON.stringify(result.data.checklists, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testChecklistUpdate();