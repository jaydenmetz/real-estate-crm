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
      
      // Test with the same query as the main controller
      const escrowQuery = `
        SELECT 
          e.*,
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage
        FROM escrows e
        WHERE ${isNumeric ? 'e.numeric_id = $1::integer' : 'e.display_id = $1'}
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
      
      // Step 2: Try to get timeline data
      let timelineData = [];
      try {
        console.log('Attempting timeline query with escrow_id =', escrow.display_id);
        const timelineResult = await pool.query(
          'SELECT * FROM escrow_timeline WHERE escrow_id = $1 LIMIT 5',
          [escrow.display_id]
        );
        console.log('Timeline query succeeded, rows:', timelineResult.rows.length);
        timelineData = timelineResult.rows;
      } catch (e) {
        console.error('Timeline query failed:', e.message);
      }
      
      // Step 3: Try to process escrow dates safely
      let acceptanceDate = 'Unknown';
      let closingDate = 'Unknown';
      
      try {
        if (escrow.acceptance_date) {
          console.log('Raw acceptance_date:', escrow.acceptance_date, 'Type:', typeof escrow.acceptance_date);
          acceptanceDate = escrow.acceptance_date.toString().split('T')[0];
        }
        if (escrow.closing_date) {
          console.log('Raw closing_date:', escrow.closing_date, 'Type:', typeof escrow.closing_date);
          closingDate = escrow.closing_date.toString().split('T')[0];
        }
      } catch (dateError) {
        console.error('Date processing error:', dateError.message);
      }
      
      // Step 4: Return response with timeline
      const response = {
        id: escrow.numeric_id,
        displayId: escrow.display_id,
        propertyAddress: escrow.property_address,
        escrowStatus: escrow.escrow_status,
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        acceptanceDate: acceptanceDate,
        closingDate: closingDate,
        // Include timeline data
        timeline: timelineData.map(event => ({
          id: event.id,
          eventName: event.event_name || event.event_type,
          type: event.event_type,
          date: event.event_date
        })),
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