const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/realestate_crm'
});

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
      let whereConditions = ['e.deleted_at IS NULL'];
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

      const whereClause = whereConditions.join(' AND ');

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
      const listQuery = `
        SELECT 
          id,
          escrow_number as escrowNumber,
          property_address as propertyAddress,
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage,
          escrow_status as escrowStatus,
          transaction_type as transactionType,
          purchase_price as purchasePrice,
          net_commission as myCommission,
          json_build_array(
            CASE WHEN buyer_name IS NOT NULL THEN
              json_build_object(
                'name', buyer_name,
                'type', 'Buyer',
                'avatar', 'https://i.pravatar.cc/150?u=buyer' || id
              )
            END,
            CASE WHEN seller_name IS NOT NULL THEN
              json_build_object(
                'name', seller_name,
                'type', 'Seller',
                'avatar', 'https://i.pravatar.cc/150?u=seller' || id
              )
            END
          ) as clients,
          closing_date as scheduledCoeDate,
          CASE 
            WHEN closing_date IS NOT NULL 
            THEN DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP)::integer
            ELSE 0
          END as daysToClose,
          64 as checklistProgress,
          priority_level as priorityLevel,
          updated_at as lastActivity,
          FLOOR(RANDOM() * 5 + 1)::integer as upcomingDeadlines
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
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrows'
        }
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
        WHERE e.id = $1 AND e.deleted_at IS NULL
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

      // Format the response
      const response = {
        id: escrow.id,
        escrowNumber: escrow.escrow_number,
        propertyAddress: escrow.property_address,
        propertyImage: escrow.propertyImage,
        escrowStatus: escrow.escrow_status,
        transactionType: escrow.transaction_type,
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || 0,
        downPayment: parseFloat(escrow.down_payment) || 0,
        loanAmount: parseFloat(escrow.loan_amount) || 0,
        commissionPercentage: parseFloat(escrow.commission_percentage) || 0,
        grossCommission: parseFloat(escrow.gross_commission) || 0,
        myCommission: parseFloat(escrow.net_commission) || 0,
        acceptanceDate: escrow.acceptance_date,
        scheduledCoeDate: escrow.closing_date,
        propertyType: escrow.property_type,
        leadSource: escrow.lead_source,
        
        // Clients array for list view compatibility
        clients: [
          escrow.buyer_name ? {
            name: escrow.buyer_name,
            type: 'Buyer',
            email: escrow.buyer_email,
            phone: escrow.buyer_phone,
            avatar: `https://i.pravatar.cc/150?u=buyer${escrow.id}`
          } : null,
          escrow.seller_name ? {
            name: escrow.seller_name,
            type: 'Seller',
            email: escrow.seller_email,
            phone: escrow.seller_phone,
            avatar: `https://i.pravatar.cc/150?u=seller${escrow.id}`
          } : null
        ].filter(Boolean),
        
        // Separate objects for detail view
        buyer: escrow.buyer_name ? {
          name: escrow.buyer_name,
          email: escrow.buyer_email,
          phone: escrow.buyer_phone
        } : null,
        seller: escrow.seller_name ? {
          name: escrow.seller_name,
          email: escrow.seller_email,
          phone: escrow.seller_phone
        } : null,
        
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
            date: escrow.created_at,
            event: 'Escrow Created',
            type: 'milestone',
            icon: 'start',
            description: 'New escrow initiated'
          },
          {
            date: escrow.acceptance_date,
            event: 'Offer Accepted',
            type: 'milestone',
            icon: 'check',
            description: 'Purchase agreement signed'
          }
        ],
        
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
        
        created_at: escrow.created_at,
        updated_at: escrow.updated_at
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
}

module.exports = SimpleEscrowController;