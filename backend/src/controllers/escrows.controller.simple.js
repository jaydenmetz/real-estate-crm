const { pool } = require('../config/database');

class SimpleEscrowController {
  static async getEscrowById(req, res) {
    try {
      const { id } = req.params;
      console.log('Fetching escrow with ID:', id);
      
      // Determine if ID is numeric or display format
      const isNumeric = /^\d+$/.test(id);
      
      // Get escrow details
      const escrowQuery = `
        SELECT 
          e.*,
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage
        FROM escrows e
        WHERE ${isNumeric ? 'e.numeric_id = $1::integer' : 'e.display_id = $1'}
      `;
      
      console.log('Running escrow query...');
      const escrowResult = await pool.query(escrowQuery, [id]);

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
      
      // Basic response without helper tables for now
      const response = {
        id: escrow.numeric_id,
        displayId: escrow.display_id,
        escrowNumber: escrow.escrow_number || escrow.display_id,
        propertyAddress: escrow.property_address,
        propertyImage: escrow.propertyImage,
        escrowStatus: escrow.escrow_status,
        transactionType: escrow.property_type || 'Single Family',
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || 0,
        downPayment: parseFloat(escrow.down_payment) || 0,
        loanAmount: parseFloat(escrow.loan_amount) || 0,
        commissionPercentage: parseFloat(escrow.commission_percentage) || 0,
        grossCommission: parseFloat(escrow.gross_commission) || 0,
        myCommission: parseFloat(escrow.net_commission) || 0,
        acceptanceDate: escrow.acceptance_date ? new Date(escrow.acceptance_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        scheduledCoeDate: escrow.closing_date ? new Date(escrow.closing_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        propertyType: escrow.property_type,
        leadSource: escrow.lead_source,
        
        // Empty arrays for now
        buyer: null,
        seller: null,
        buyerAgent: null,
        listingAgent: null,
        participants: [],
        checklist: [],
        checklistProgress: {
          phase1: { completed: 0, total: 0, percentage: 0 },
          phase2: { completed: 0, total: 0, percentage: 0 },
          phase3: { completed: 0, total: 0, percentage: 0 },
          overall: { completed: 0, total: 0, percentage: 0 }
        },
        timeline: [],
        financials: [],
        documents: [],
        
        propertyDetails: {
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1850,
          yearBuilt: 2005,
          lotSize: '7,500 sqft',
          propertyTax: '$8,500/year',
          hoaFees: '$350/month'
        },
        
        activityStats: {
          daysInEscrow: escrow.closing_date ? 
            Math.floor((new Date() - new Date(escrow.acceptance_date || escrow.created_at)) / (24 * 60 * 60 * 1000)) : 0,
          daysToClose: escrow.closing_date ? 
            Math.floor((new Date(escrow.closing_date) - new Date()) / (24 * 60 * 60 * 1000)) : 0,
          tasksCompletedToday: 0,
          upcomingDeadlines: 0,
          documentsUploaded: 0,
          communicationScore: 95
        },
        
        importantNotes: 'Buyer pre-approved for loan. Inspection scheduled for next week.',
        
        created_at: escrow.created_at ? new Date(escrow.created_at).toISOString() : new Date().toISOString(),
        updated_at: escrow.updated_at ? new Date(escrow.updated_at).toISOString() : new Date().toISOString()
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Error in getEscrowById:', error.message);
      console.error('Full error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow details',
          debug: error.message
        }
      });
    }
  }
}

module.exports = SimpleEscrowController;