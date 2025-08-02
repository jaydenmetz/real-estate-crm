const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorLogging');

// Cache for schema detection
let schemaInfo = null;

// Helper function to detect database schema
async function detectSchema() {
  if (schemaInfo) return schemaInfo;
  
  try {
    // Check what columns exist in the escrows table
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      AND column_name IN ('id', 'numeric_id', 'team_sequence_id', 'net_commission', 'acceptance_date', 'buyer_side_commission', 'opening_date', 'uuid')
    `);
    
    const columns = result.rows.map(row => row.column_name);
    schemaInfo = {
      hasId: columns.includes('id'),
      hasNumericId: columns.includes('numeric_id'),
      hasTeamSequenceId: columns.includes('team_sequence_id'),
      hasNetCommission: columns.includes('net_commission'),
      hasAcceptanceDate: columns.includes('acceptance_date'),
      hasBuyerSideCommission: columns.includes('buyer_side_commission'),
      hasOpeningDate: columns.includes('opening_date'),
      hasUuid: columns.includes('uuid')
    };
    
    console.log('Detected schema columns:', columns);
    console.log('Schema info:', schemaInfo);
    return schemaInfo;
  } catch (error) {
    console.error('Schema detection error:', error);
    // Default to production schema if detection fails
    schemaInfo = {
      hasId: true,  // Production should have id column
      hasNumericId: true,
      hasTeamSequenceId: true,
      hasNetCommission: true,
      hasAcceptanceDate: true,
      hasBuyerSideCommission: false,
      hasOpeningDate: false,
      hasUuid: false
    };
    return schemaInfo;
  }
}

class SimpleEscrowController {
  /**
   * Get all escrows with buyers and sellers for list view
   */
  static async getAllEscrows(req, res) {
    try {
      console.log('\n=== getAllEscrows called ===');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Database URL exists:', !!process.env.DATABASE_URL);
      const {
        page = 1,
        limit = 20,
        status,
        sort = 'created_at',
        order = 'desc',
        search
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Detect schema
      const schema = await detectSchema();
      
      // Check if escrows table exists and has data
      try {
        const tableCheck = await pool.query(`
          SELECT 
            COUNT(*) as count,
            MIN(id::text) as first_id,
            MAX(id::text) as last_id
          FROM escrows
        `);
        console.log('Escrows table check:', tableCheck.rows[0]);
      } catch (checkError) {
        console.error('Error checking escrows table:', checkError.message);
      }
      
      // Debug: Check what IDs exist in the database
      try {
        const idCheckQuery = `
          SELECT 
            ${schema.hasTeamSequenceId ? 'team_sequence_id' : schema.hasNumericId ? 'numeric_id' : 'id'} as primary_id,
            ${schema.hasNumericId ? 'numeric_id' : 'NULL'} as numeric_id,
            ${schema.hasTeamSequenceId ? 'team_sequence_id' : 'NULL'} as team_sequence_id,
            display_id,
            property_address
          FROM escrows
          ORDER BY ${schema.hasTeamSequenceId ? 'team_sequence_id' : schema.hasNumericId ? 'numeric_id' : 'id'}
          LIMIT 10
        `;
        const idCheckResult = await pool.query(idCheckQuery);
        console.log('\n=== Database ID Check ===');
        console.log('First 10 escrows in database:');
        idCheckResult.rows.forEach(row => {
          console.log(`  Primary ID: ${row.primary_id}, Numeric ID: ${row.numeric_id}, Team Seq ID: ${row.team_sequence_id}, Display ID: ${row.display_id}, Address: ${row.property_address}`);
        });
        console.log('========================\n');
      } catch (err) {
        console.error('ID check query failed:', err.message);
      }

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
        whereConditions.push(`(e.property_address ILIKE $${paramIndex} OR e.display_id ILIKE $${paramIndex})`);
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
      console.log('Count Query:', countQuery);
      console.log('Count Query Params:', queryParams);
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);
      console.log('Total escrows in database:', totalCount);

      // Build dynamic query based on schema
      queryParams.push(limit, offset);
      const envSuffix = process.env.NODE_ENV === 'development' ? ' - LOCAL' : '';
      
      // Build field selections based on available columns
      // Always use id as the UUID column
      let idField = 'id::text';
      let displayIdField = 'display_id';  // Format: ESCROW-2025-0001
      
      console.log('Using ID field:', idField);
      console.log('Schema info:', schema);
      
      let commissionField;
      if (schema.hasNetCommission && schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(net_commission, buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
      } else if (schema.hasNetCommission) {
        commissionField = 'COALESCE(net_commission, 0)';
      } else if (schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
      } else {
        commissionField = '0';
      }
      
      let acceptanceDateField;
      if (schema.hasAcceptanceDate && schema.hasOpeningDate) {
        acceptanceDateField = 'COALESCE(TO_CHAR(acceptance_date, \'YYYY-MM-DD\'), TO_CHAR(opening_date, \'YYYY-MM-DD\'), TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\'))';
      } else if (schema.hasAcceptanceDate) {
        acceptanceDateField = 'COALESCE(TO_CHAR(acceptance_date, \'YYYY-MM-DD\'), TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\'))';
      } else if (schema.hasOpeningDate) {
        acceptanceDateField = 'COALESCE(TO_CHAR(opening_date, \'YYYY-MM-DD\'), TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\'))';
      } else {
        acceptanceDateField = 'TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\')';
      }
      
      const listQuery = `
        SELECT 
          ${idField} as id,
          ${displayIdField} as "displayId",
          ${displayIdField} as "escrowNumber",
          property_address || '${envSuffix}' as "propertyAddress",
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as "propertyImage",
          escrow_status as "escrowStatus",
          purchase_price as "purchasePrice",
          ${commissionField} as "myCommission",
          '[]'::jsonb as clients,
          ${acceptanceDateField} as "acceptanceDate",
          COALESCE(TO_CHAR(closing_date, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')) as "scheduledCoeDate",
          CASE 
            WHEN closing_date IS NOT NULL 
            THEN DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP)::integer
            ELSE 0
          END as "daysToClose",
          64 as "checklistProgress",
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

      console.log('List Query:', listQuery);
      console.log('List Query Params:', queryParams);
      const listResult = await pool.query(listQuery, queryParams);
      console.log('Query executed, rows returned:', listResult.rows.length);
      
      // Debug: Log the actual IDs being returned
      console.log('Escrows returned from database:');
      listResult.rows.forEach((escrow, index) => {
        console.log(`  ${index + 1}. ID: ${escrow.id}, numeric_id: ${escrow.numeric_id}, team_seq_id: ${escrow.team_sequence_id}, Display ID: ${escrow.displayId}, Address: ${escrow.propertyAddress}`);
      });
      console.log(`Total escrows: ${listResult.rows.length}`);
      
      // Special check for ESC-2025-001 or ESC-2025-0001
      const escrow2025001 = listResult.rows.find(e => e.displayId === 'ESC-2025-001' || e.displayId === 'ESC-2025-0001');
      if (escrow2025001) {
        console.log('\n=== First Escrow Debug Info ===');
        console.log('Display ID:', escrow2025001.displayId);
        console.log('ID (used for navigation):', escrow2025001.id);
        console.log('Numeric ID:', escrow2025001.numeric_id);
        console.log('Team Sequence ID:', escrow2025001.team_sequence_id);
        console.log('Full record:', JSON.stringify(escrow2025001, null, 2));
        console.log('==============================\n');
      }

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
   * Get single escrow by ID with full details including helper tables
   * Supports both numeric ID (1, 2, 3) and display ID (ESC-2025-001)
   */
  static async getEscrowById(req, res) {
    try {
      const { id } = req.params;
      
      // Detect schema
      const schema = await detectSchema();
      
      // Determine if ID is UUID (with or without prefix) or display format
      // Handle both "esc" and "escrow-" prefixes
      const isUUID = /^(esc|escrow-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Build query to handle UUID, numeric ID, or display ID
      let whereClause;
      let queryValue = id;
      
      if (isUUID) {
        // UUID format - use id column
        // Don't cast to uuid type since we might have TEXT column with prefixes
        whereClause = 'e.id = $1';
      } else if (/^\d+$/.test(id)) {
        // Pure numeric - use numeric_id or team_sequence_id
        if (schema.hasNumericId) {
          whereClause = 'e.numeric_id = $1::integer';
        } else if (schema.hasTeamSequenceId) {
          whereClause = 'e.team_sequence_id = $1::integer';
        } else {
          whereClause = 'e.display_id = $1';
        }
      } else if (/^ESCROW-\d{4}-\d{4}$/i.test(id)) {
        // Display ID format (ESCROW-2025-0001)
        whereClause = 'e.display_id = $1';
      } else {
        // Try all three formats
        whereClause = '(e.id = $1 OR e.display_id = $1 OR (e.numeric_id IS NOT NULL AND e.numeric_id::text = $1))';
      }
      
      // Get escrow details
      const escrowQuery = `
        SELECT 
          e.*,
          COALESCE(e.property_image_url, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800') as propertyImage
        FROM escrows e
        WHERE ${whereClause}
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
      
      // Build simplified response according to new spec
      const response = {
        id: escrow.id,
        escrowNumber: escrow.display_id,
        propertyAddress: escrow.property_address,
        escrowStatus: escrow.escrow_status,
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        commissionPercentage: parseFloat(escrow.commission_percentage) || 3,
        grossCommission: parseFloat(escrow.gross_commission) || 0,
        myCommission: parseFloat(escrow.my_commission) || 0,
        commissionAdjustments: parseFloat(escrow.commission_adjustments) || 0,
        expenseAdjustments: parseFloat(escrow.expense_adjustments) || 0,
        acceptanceDate: escrow.acceptance_date ? 
          (typeof escrow.acceptance_date === 'string' ? escrow.acceptance_date.split('T')[0] : new Date(escrow.acceptance_date).toISOString().split('T')[0])
          : null,
        scheduledCoeDate: escrow.closing_date ? 
          (typeof escrow.closing_date === 'string' ? escrow.closing_date.split('T')[0] : new Date(escrow.closing_date).toISOString().split('T')[0])
          : null,
        actualCoeDate: escrow.actual_coe_date ? 
          (typeof escrow.actual_coe_date === 'string' ? escrow.actual_coe_date.split('T')[0] : new Date(escrow.actual_coe_date).toISOString().split('T')[0])
          : null,
        leadSource: escrow.lead_source || 'Family',
        transactionCoordinator: escrow.transaction_coordinator || 'Karin Munoz',
        nhdCompany: escrow.nhd_company || 'Property ID Max',
        avid: escrow.avid || true,
        created_at: escrow.created_at,
        updated_at: escrow.updated_at,
        
        // Add JSONB data at the bottom
        people: escrow.people || {},
        timeline: escrow.timeline || [],
        financials: escrow.financials || {},
        checklists: (() => {
          const defaultChecklists = {
            admin: {
              addContactsToNotion: false,
              addContactsToPhone: false,
              mlsStatusUpdate: false,
              tcEmail: false,
              tcGlideInvite: false
            },
            loan: {
              le: false,
              lockedRate: false,
              appraisalOrdered: false,
              appraisalReceived: false,
              clearToClose: false,
              cd: false,
              loanDocsSigned: false,
              cashToClosePaid: false,
              loanFunded: false
            },
            home: {
              emd: false,
              homeInspectionOrdered: false,
              homeInspectionReceived: false,
              sellerDisclosures: false,
              avid: false,
              solarTransferInitiated: false,
              rr: false,
              cr: false,
              vp: false,
              recorded: false
            }
          };
          
          if (!escrow.checklists) return defaultChecklists;
          
          return {
            admin: { ...defaultChecklists.admin, ...(escrow.checklists.admin || {}) },
            loan: { ...defaultChecklists.loan, ...(escrow.checklists.loan || {}) },
            home: { ...defaultChecklists.home, ...(escrow.checklists.home || {}) }
          };
        })(),
        documents: escrow.documents || []
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
          message: 'Failed to fetch escrow details',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Get escrow statistics for dashboard
   */
  static async getEscrowStats(req, res) {
    try {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      // Detect schema
      const schema = await detectSchema();
      
      // Build commission field based on schema
      let commissionField;
      if (schema.hasNetCommission && schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(net_commission, buyer_side_commission * purchase_price / 100, 0)';
      } else if (schema.hasNetCommission) {
        commissionField = 'COALESCE(net_commission, 0)';
      } else if (schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(buyer_side_commission * purchase_price / 100, 0)';
      } else {
        commissionField = '0';
      }
      
      // Get basic counts
      const statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE escrow_status = 'Active') as active,
          COUNT(*) FILTER (WHERE escrow_status = 'Pending') as pending,
          COUNT(*) FILTER (WHERE escrow_status = 'Closed') as closed,
          COUNT(*) as total,
          SUM(purchase_price) as total_volume,
          SUM(${commissionField}) as total_commission
        FROM escrows
      `;
      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];
      
      // Get closed this month
      const closedThisMonthQuery = `
        SELECT COUNT(*) as count
        FROM escrows
        WHERE escrow_status = 'Closed'
        AND EXTRACT(MONTH FROM closing_date) = $1
        AND EXTRACT(YEAR FROM closing_date) = $2
      `;
      const closedThisMonthResult = await pool.query(closedThisMonthQuery, [thisMonth + 1, thisYear]);
      const closedThisMonth = parseInt(closedThisMonthResult.rows[0].count);
      
      // Calculate average days to close
      const startDateField = schema.hasAcceptanceDate ? 
        (schema.hasOpeningDate ? 'COALESCE(acceptance_date, opening_date)' : 'acceptance_date') :
        (schema.hasOpeningDate ? 'opening_date' : 'created_at');
        
      const avgDaysQuery = `
        SELECT AVG(
          DATE_PART('day', closing_date - ${startDateField})
        ) as avg_days
        FROM escrows
        WHERE escrow_status = 'Closed'
        AND closing_date IS NOT NULL
        AND ${startDateField} IS NOT NULL
      `;
      const avgDaysResult = await pool.query(avgDaysQuery);
      const avgDaysToClose = Math.round(avgDaysResult.rows[0].avg_days || 30);
      
      // Get pipeline data
      const pipelineQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE escrow_status = 'Active' AND closing_date <= CURRENT_DATE + INTERVAL '7 days') as this_week,
          COUNT(*) FILTER (WHERE escrow_status = 'Active' AND closing_date <= CURRENT_DATE + INTERVAL '30 days') as this_month,
          COUNT(*) FILTER (WHERE escrow_status = 'Active' AND closing_date > CURRENT_DATE + INTERVAL '30 days' AND closing_date <= CURRENT_DATE + INTERVAL '60 days') as next_month,
          SUM(${commissionField}) FILTER (WHERE escrow_status = 'Active') as projected_revenue
        FROM escrows
      `;
      const pipelineResult = await pool.query(pipelineQuery);
      const pipeline = pipelineResult.rows[0];
      
      // Generate monthly trends for the last 6 months
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const trendMonth = new Date(thisYear, thisMonth - i, 1);
        const monthName = trendMonth.toLocaleString('default', { month: 'short' });
        
        const trendQuery = `
          SELECT 
            COUNT(*) as closed,
            COALESCE(SUM(purchase_price), 0) as volume
          FROM escrows
          WHERE escrow_status = 'Closed'
          AND EXTRACT(MONTH FROM closing_date) = $1
          AND EXTRACT(YEAR FROM closing_date) = $2
        `;
        
        const trendResult = await pool.query(trendQuery, [
          trendMonth.getMonth() + 1,
          trendMonth.getFullYear()
        ]);
        
        trends.push({
          month: monthName,
          closed: parseInt(trendResult.rows[0].closed),
          volume: parseFloat(trendResult.rows[0].volume)
        });
      }
      
      res.json({
        success: true,
        data: {
          overview: {
            activeEscrows: parseInt(stats.active),
            pendingEscrows: parseInt(stats.pending),
            closedThisMonth,
            totalVolume: parseFloat(stats.total_volume) || 0,
            totalCommission: parseFloat(stats.total_commission) || 0,
            avgDaysToClose
          },
          performance: {
            closingRate: stats.total > 0 ? Math.round((parseInt(stats.closed) / parseInt(stats.total)) * 100) : 0,
            avgListToSaleRatio: 98.5,
            clientSatisfaction: 4.8,
            onTimeClosingRate: 89
          },
          pipeline: {
            thisWeek: parseInt(pipeline.this_week),
            thisMonth: parseInt(pipeline.this_month),
            nextMonth: parseInt(pipeline.next_month),
            projectedRevenue: parseFloat(pipeline.projected_revenue) || 0
          },
          trends
        }
      });
      
    } catch (error) {
      console.error('Error fetching escrow stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow statistics'
        }
      });
    }
  }

  /**
   * Update an escrow
   */
  static async updateEscrow(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'display_id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update'
          }
        });
      }
      
      // Determine if ID is numeric or display format
      // Handle both "esc" and "escrow-" prefixes
      const isUUID = /^(esc|escrow-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      values.push(id);
      
      const updateQuery = `
        UPDATE escrows 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE ${isUUID ? 'id = $' + paramIndex + '::uuid' : 'display_id = $' + paramIndex}
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0],
        message: 'Escrow updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update escrow'
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Delete an escrow
   */
  static async deleteEscrow(req, res) {
    try {
      const { id } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const result = await pool.query(
        `DELETE FROM escrows WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'} RETURNING display_id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Escrow deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete escrow'
        }
      });
    }
  }

  /**
   * Create a new escrow with auto-incrementing ID and helper tables
   */
  static async createEscrow(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const escrowData = req.body;
      
      // After migration, the database will automatically:
      // - Generate UUID for id
      // - Generate numeric_id from sequence
      // - Generate display_id via trigger (ESCROW-2025-0001 format)
      
      // Insert the new escrow
      const insertQuery = `
        INSERT INTO escrows (
          property_address, escrow_status, purchase_price,
          earnest_money, buyer_side_commission,
          opening_date, closing_date, property_type, transaction_type,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        escrowData.property_address,
        escrowData.escrow_status || 'active',
        escrowData.purchase_price,
        escrowData.earnest_money || escrowData.purchase_price * 0.01,
        escrowData.buyer_side_commission || 2.5,
        escrowData.opening_date || new Date().toISOString().split('T')[0],
        escrowData.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        escrowData.property_type || 'Single Family',
        escrowData.transaction_type || 'purchase'
      ];
      
      const escrowResult = await client.query(insertQuery, values);
      const newEscrow = escrowResult.rows[0];
      
      // Create default checklist items
      const defaultChecklist = [
        // Opening Phase
        { phase: 'opening', task_name: 'Open Escrow', task_description: 'Officially open escrow with title company', is_completed: false, due_days: 0, order: 1 },
        { phase: 'opening', task_name: 'Earnest Money Deposit', task_description: 'Collect and deposit earnest money', is_completed: false, due_days: 3, order: 2 },
        { phase: 'opening', task_name: 'Preliminary Title Report', task_description: 'Order and review preliminary title report', is_completed: false, due_days: 5, order: 3 },
        { phase: 'opening', task_name: 'Property Disclosures', task_description: 'Deliver all required property disclosures', is_completed: false, due_days: 7, order: 4 },
        { phase: 'opening', task_name: 'Home Inspection', task_description: 'Schedule and complete home inspection', is_completed: false, due_days: 10, order: 5 },
        
        // Processing Phase
        { phase: 'processing', task_name: 'Loan Application', task_description: 'Submit complete loan application', is_completed: false, due_days: 5, order: 6 },
        { phase: 'processing', task_name: 'Appraisal', task_description: 'Schedule and complete property appraisal', is_completed: false, due_days: 15, order: 7 },
        { phase: 'processing', task_name: 'Loan Approval', task_description: 'Obtain final loan approval', is_completed: false, due_days: 25, order: 8 },
        { phase: 'processing', task_name: 'Insurance', task_description: 'Secure homeowners insurance', is_completed: false, due_days: 20, order: 9 },
        { phase: 'processing', task_name: 'HOA Documents', task_description: 'Review HOA documents if applicable', is_completed: false, due_days: 15, order: 10 },
        
        // Closing Phase
        { phase: 'closing', task_name: 'Final Walkthrough', task_description: 'Complete final property walkthrough', is_completed: false, due_days: -2, order: 11 },
        { phase: 'closing', task_name: 'Closing Documents', task_description: 'Review and sign closing documents', is_completed: false, due_days: -1, order: 12 },
        { phase: 'closing', task_name: 'Fund Loan', task_description: 'Lender funds the loan', is_completed: false, due_days: 0, order: 13 },
        { phase: 'closing', task_name: 'Record Deed', task_description: 'Record deed with county', is_completed: false, due_days: 0, order: 14 },
        { phase: 'closing', task_name: 'Deliver Keys', task_description: 'Deliver keys to new owner', is_completed: false, due_days: 0, order: 15 }
      ];
      
      // Calculate due dates based on escrow dates
      const acceptanceDate = new Date(newEscrow.opening_date);
      const closingDate = new Date(newEscrow.closing_date);
      
      const checklistWithDates = defaultChecklist.map(item => ({
        ...item,
        due_date: item.due_days >= 0 
          ? new Date(acceptanceDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(closingDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: null
      }));
      
      // Insert checklist items as JSONB
      const checklistQuery = `
        INSERT INTO escrow_checklists (escrow_display_id, checklist_items)
        VALUES ($1, $2)
      `;
      await client.query(checklistQuery, [newEscrow.display_id, JSON.stringify(checklistWithDates)]);
      
      await client.query('COMMIT');
      
      // Return success with UUID only
      res.status(201).json({
        success: true,
        data: {
          id: newEscrow.id,  // UUID
          displayId: newEscrow.display_id,  // ESCROW-2025-0001
          message: 'Escrow created successfully with checklist items'
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create escrow',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Get escrow people/participants
   */
  static async getEscrowPeople(req, res) {
    try {
      const { id } = req.params;
      
      // Detect if ID is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT people
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const people = result.rows[0].people || {};
      
      res.json({
        success: true,
        data: people
      });
      
    } catch (error) {
      console.error('Error fetching escrow people:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow people'
        }
      });
    }
  }

  /**
   * Get escrow timeline
   */
  static async getEscrowTimeline(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT timeline, acceptance_date
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      let timeline = result.rows[0].timeline || [];
      
      // If timeline is empty, generate default timeline based on acceptance date
      if (timeline.length === 0 && result.rows[0].acceptance_date) {
        const acceptanceDate = new Date(result.rows[0].acceptance_date);
        timeline = [
          {
            date: acceptanceDate.toISOString().split('T')[0],
            event: 'Acceptance Date',
            status: 'completed',
            daysFromAcceptance: 0
          },
          {
            date: new Date(acceptanceDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            event: 'EMD Date',
            status: 'pending',
            daysFromAcceptance: 3
          },
          {
            date: new Date(acceptanceDate.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            event: 'Contingencies Date',
            status: 'pending',
            daysFromAcceptance: 17
          },
          {
            date: new Date(acceptanceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            event: 'COE Date',
            status: 'pending',
            daysFromAcceptance: 30
          }
        ];
      }
      
      res.json({
        success: true,
        data: timeline
      });
      
    } catch (error) {
      console.error('Error fetching escrow timeline:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow timeline'
        }
      });
    }
  }

  /**
   * Get escrow financials
   */
  static async getEscrowFinancials(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT 
          purchase_price,
          earnest_money_deposit,
          commission_percentage,
          gross_commission,
          my_commission,
          commission_adjustments,
          expense_adjustments,
          financials,
          expenses
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const escrow = result.rows[0];
      const financials = escrow.financials || {};
      const expenses = escrow.expenses || [];
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Build financial data response
      const data = {
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || 0,
        commissionBreakdown: {
          commissionPercentage: parseFloat(escrow.commission_percentage) || 3,
          grossCommission: parseFloat(escrow.gross_commission) || 0,
          myCommission: parseFloat(escrow.my_commission) || 0,
          commissionAdjustments: parseFloat(escrow.commission_adjustments) || 0,
          expenseAdjustments: parseFloat(escrow.expense_adjustments) || 0,
          netCommission: (parseFloat(escrow.my_commission) || 0) + 
                        (parseFloat(escrow.commission_adjustments) || 0) + 
                        (parseFloat(escrow.expense_adjustments) || 0)
        },
        expenses: expenses,
        totalExpenses: totalExpenses,
        ...financials
      };
      
      res.json({
        success: true,
        data: data
      });
      
    } catch (error) {
      console.error('Error fetching escrow financials:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow financials'
        }
      });
    }
  }

  /**
   * Get escrow checklists
   */
  static async getEscrowChecklists(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT checklists
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Default checklist structure with all items false
      const defaultChecklists = {
        admin: {
          addContactsToNotion: false,
          addContactsToPhone: false,
          mlsStatusUpdate: false,
          tcEmail: false,
          tcGlideInvite: false
        },
        loan: {
          le: false,
          lockedRate: false,
          appraisalOrdered: false,
          appraisalReceived: false,
          clearToClose: false,
          cd: false,
          loanDocsSigned: false,
          cashToClosePaid: false,
          loanFunded: false
        },
        home: {
          emd: false,
          homeInspectionOrdered: false,
          homeInspectionReceived: false,
          sellerDisclosures: false,
          avid: false,
          solarTransferInitiated: false,
          rr: false,
          cr: false,
          vp: false,
          recorded: false
        }
      };
      
      // Merge stored data with defaults to ensure all keys exist
      const checklists = result.rows[0].checklists ? 
        {
          admin: { ...defaultChecklists.admin, ...(result.rows[0].checklists.admin || {}) },
          loan: { ...defaultChecklists.loan, ...(result.rows[0].checklists.loan || {}) },
          home: { ...defaultChecklists.home, ...(result.rows[0].checklists.home || {}) }
        } : defaultChecklists;
      
      res.json({
        success: true,
        data: checklists
      });
      
    } catch (error) {
      console.error('Error fetching escrow checklists:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow checklists'
        }
      });
    }
  }

  /**
   * Get escrow documents
   */
  static async getEscrowDocuments(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT documents
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const documents = result.rows[0].documents || [];
      
      res.json({
        success: true,
        data: documents
      });
      
    } catch (error) {
      console.error('Error fetching escrow documents:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow documents'
        }
      });
    }
  }

  /**
   * Update escrow people
   */
  static async updateEscrowPeople(req, res) {
    try {
      const { id } = req.params;
      const people = req.body;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        UPDATE escrows
        SET people = $2, updated_at = NOW()
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
        RETURNING id
      `;
      
      const result = await pool.query(query, [id, JSON.stringify(people)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: people,
        message: 'Escrow people updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow people:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow people'
        }
      });
    }
  }

  /**
   * Update escrow checklists
   */
  static async updateEscrowChecklists(req, res) {
    try {
      const { id } = req.params;
      const checklists = req.body;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        UPDATE escrows
        SET checklists = $2, updated_at = NOW()
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
        RETURNING id
      `;
      
      const result = await pool.query(query, [id, JSON.stringify(checklists)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: checklists,
        message: 'Escrow checklists updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow checklists:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow checklists'
        }
      });
    }
  }
}

module.exports = SimpleEscrowController;