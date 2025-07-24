const { pool } = require('../config/database');

class MinimalEscrowController {
  static async getEscrowById(req, res) {
    const { id } = req.params;
    console.log('=== MINIMAL ESCROW CONTROLLER ===');
    console.log('Requested ID:', id);
    console.log('ID is numeric:', /^\d+$/.test(id));
    
    try {
      // Step 1: Just try to get the escrow
      const isNumeric = /^\d+$/.test(id);
      console.log('Step 1: Getting escrow...');
      
      const escrowQuery = `
        SELECT numeric_id, display_id, property_address, escrow_status, purchase_price
        FROM escrows 
        WHERE ${isNumeric ? 'numeric_id = $1::integer' : 'display_id = $1'}
      `;
      
      const escrowResult = await pool.query(escrowQuery, [id]);
      console.log('Escrow query result rows:', escrowResult.rows.length);
      
      if (escrowResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const escrow = escrowResult.rows[0];
      console.log('Found escrow:', escrow.display_id);
      
      // Step 2: Return minimal response
      const response = {
        id: escrow.numeric_id,
        displayId: escrow.display_id,
        propertyAddress: escrow.property_address,
        escrowStatus: escrow.escrow_status,
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        // Empty arrays for helper data
        timeline: [],
        financials: [],
        documents: [],
        participants: []
      };
      
      console.log('Returning minimal response');
      
      res.json({
        success: true,
        data: response
      });
      
    } catch (error) {
      console.error('=== ERROR IN MINIMAL CONTROLLER ===');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error detail:', error.detail);
      console.error('Full error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow details',
          debug: {
            message: error.message,
            code: error.code
          }
        }
      });
    }
  }
}

module.exports = MinimalEscrowController;