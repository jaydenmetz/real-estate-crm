const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorLogging');

class SimpleEscrowController {
  /**
   * Get all escrows with buyers and sellers for list view
   */
  static async getAllEscrows(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sort = 'created_at',
        order = 'desc',
        search
      } = req.query;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (status && status !== 'all') {
        whereConditions.push(`e.escrow_status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(e.property_address ILIKE $${paramIndex} OR e.id ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM escrows e
        WHERE ${whereClause}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Main query - simplified with data directly from escrows table
      queryParams.push(limit, offset);
      // Add environment suffix for local development
      const envSuffix = process.env.NODE_ENV === 'development' ? ' - LOCAL' : '';
      
      const listQuery = `
        SELECT 
          id,
          id as "escrowNumber",
          property_address || '${envSuffix}' as "propertyAddress",
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as "propertyImage",
          escrow_status as "escrowStatus",
          property_type as "transactionType",
          purchase_price as "purchasePrice",
          net_commission as "myCommission",
          '[]'::jsonb as clients,
          COALESCE(TO_CHAR(acceptance_date, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) as "acceptanceDate",
          COALESCE(TO_CHAR(closing_date, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')) as "scheduledCoeDate",
          CASE 
            WHEN closing_date IS NOT NULL 
            THEN DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP)::integer
            ELSE 0
          END as "daysToClose",
          64 as "checklistProgress",
          'medium' as "priorityLevel",
          CASE 
            WHEN updated_at IS NOT NULL THEN TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
            WHEN created_at IS NOT NULL THEN TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
            ELSE TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
          END as "lastActivity",
          FLOOR(RANDOM() * 5 + 1)::integer as "upcomingDeadlines"
        FROM escrows e
        WHERE ${whereClause}
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const listResult = await pool.query(listQuery, queryParams);

      res.json({
        success: true,
        data: {
          escrows: listResult.rows,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching escrows:', error);
      
      // Provide more detailed error information
      const errorResponse = {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrows',
        details: {
          errorMessage: error.message,
          errorCode: error.code,
          errorName: error.name
        }
      };
      
      // Add database connection info
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorResponse.details.hint = 'Database connection failed - check DATABASE_URL';
      }
      
      res.status(500).json({
        success: false,
        error: errorResponse
      });
    }
  }

  /**
   * Get single escrow by ID with full details
   */
  static async getEscrowById(req, res) {
    try {
      const { id } = req.params;

      // Get escrow details - now from single table
      const escrowQuery = `
        SELECT 
          e.*,
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage
        FROM escrows e
        WHERE e.id = $1
      `;
      
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
      
      // Add environment suffix for local development
      const envSuffix = process.env.NODE_ENV === 'development' ? ' - LOCAL' : '';

      // Format the response
      const response = {
        id: escrow.id,
        escrowNumber: escrow.escrow_number || escrow.id,
        propertyAddress: escrow.property_address + envSuffix,
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
        
        // Clients array for list view compatibility
        clients: [],
        
        // Separate objects for detail view
        buyer: null,
        seller: null,
        
        // Mock data for features not yet implemented
        propertyDetails: {
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1850,
          yearBuilt: 2005,
          lotSize: '7,500 sqft',
          propertyTax: '$8,500/year',
          hoaFees: '$350/month'
        },
        
        timeline: [
          {
            date: escrow.created_at ? new Date(escrow.created_at).toISOString() : new Date().toISOString(),
            event: 'Escrow Created',
            type: 'milestone',
            icon: 'start',
            description: 'New escrow initiated'
          },
          escrow.acceptance_date ? {
            date: new Date(escrow.acceptance_date).toISOString(),
            event: 'Offer Accepted',
            type: 'milestone',
            icon: 'check',
            description: 'Purchase agreement signed'
          } : null
        ].filter(Boolean),
        
        checklistProgress: {
          phase1: { completed: 8, total: 10, percentage: 80 },
          phase2: { completed: 5, total: 8, percentage: 62.5 },
          phase3: { completed: 3, total: 7, percentage: 42.8 },
          overall: { completed: 16, total: 25, percentage: 64 }
        },
        
        activityStats: {
          daysInEscrow: escrow.closing_date ? 
            Math.floor((new Date() - new Date(escrow.acceptance_date || escrow.created_at)) / (24 * 60 * 60 * 1000)) : 0,
          daysToClose: escrow.closing_date ? 
            Math.floor((new Date(escrow.closing_date) - new Date()) / (24 * 60 * 60 * 1000)) : 0,
          tasksCompletedToday: 2,
          upcomingDeadlines: 4,
          documentsUploaded: 12,
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
      console.error('Error fetching escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow details'
        }
      });
    }
  }

  /**
   * Create a new escrow with auto-incrementing ID
   */
  static async createEscrow(req, res) {
    try {
      const escrowData = req.body;
      
      // Get the next ID
      const idResult = await pool.query(
        'SELECT COALESCE(MAX(id::integer), 0) + 1 as next_id FROM escrows WHERE deleted_at IS NULL'
      );
      const nextId = idResult.rows[0].next_id;
      
      // Insert the new escrow
      const insertQuery = `
        INSERT INTO escrows (
          id, property_address, escrow_status, purchase_price,
          earnest_money_deposit, down_payment, loan_amount,
          commission_percentage, gross_commission, net_commission,
          acceptance_date, closing_date, property_type, lead_source,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        nextId.toString(),
        escrowData.property_address,
        escrowData.escrow_status || 'Active',
        escrowData.purchase_price,
        escrowData.earnest_money_deposit || escrowData.purchase_price * 0.01,
        escrowData.down_payment || escrowData.purchase_price * 0.2,
        escrowData.loan_amount || escrowData.purchase_price * 0.8,
        escrowData.commission_percentage || 2.5,
        escrowData.gross_commission || escrowData.purchase_price * (escrowData.commission_percentage || 2.5) / 100,
        escrowData.net_commission || escrowData.purchase_price * (escrowData.commission_percentage || 2.5) / 100 * 0.5,
        escrowData.acceptance_date || new Date().toISOString().split('T')[0],
        escrowData.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        escrowData.property_type || 'Single Family',
        escrowData.lead_source || 'Website'
      ];
      
      const result = await pool.query(insertQuery, values);
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Escrow created successfully'
      });
      
    } catch (error) {
      console.error('Error creating escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create escrow',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }
}

module.exports = SimpleEscrowController;