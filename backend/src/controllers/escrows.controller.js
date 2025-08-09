const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorLogging');
const { buildRestructuredEscrowResponse } = require('./escrows.restructured');

// Cache for schema detection
let schemaInfo = null;

// Clear schema cache on startup to ensure fresh detection
if (process.env.NODE_ENV === 'production') {
  schemaInfo = null;
}

// Helper function to detect database schema
async function detectSchema() {
  if (schemaInfo) return schemaInfo;
  
  try {
    // Check what columns exist in the escrows table
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      AND column_name IN ('id', 'numeric_id', 'team_sequence_id', 'net_commission', 'my_commission', 'acceptance_date', 'buyer_side_commission', 'opening_date', 'uuid')
    `);
    
    const columns = result.rows.map(row => row.column_name);
    schemaInfo = {
      hasId: columns.includes('id'),
      hasNumericId: columns.includes('numeric_id'),
      hasTeamSequenceId: columns.includes('team_sequence_id'),
      hasNetCommission: columns.includes('net_commission'),
      hasMyCommission: columns.includes('my_commission'),
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
      console.log('User:', req.user?.email, 'Team:', req.user?.teamId);
      
      const {
        page = 1,
        limit = 20,
        status,
        sort = 'created_at',
        order = 'desc',
        search
      } = req.query;
      
      // Get user context for filtering
      const userId = req.user?.id;
      const teamId = req.user?.teamId;
      const userRole = req.user?.role;

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
      if (schema.hasMyCommission && schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(my_commission, net_commission, buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
      } else if (schema.hasMyCommission) {
        commissionField = 'COALESCE(my_commission, net_commission, 0)';
      } else if (schema.hasNetCommission && schema.hasBuyerSideCommission) {
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
          COALESCE(property_image_url, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800') as "propertyImage",
          zillow_url as "zillowUrl",
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
      let { id } = req.params;
      
      // Strip the "escrow-" prefix if present (we don't want it)
      if (id.startsWith('escrow-')) {
        id = id.substring(7);
      }
      
      // Detect schema
      const schema = await detectSchema();
      
      // Determine if ID is UUID format or display format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
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
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage
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
      
      // Use the restructured response builder
      const response = buildRestructuredEscrowResponse(escrow);

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
      
      // Strip the "escrow-" prefix if present (we don't want it)
      let cleanId = id;
      if (id.startsWith('escrow-')) {
        cleanId = id.substring(7);
      }
      
      // Determine if ID is UUID format or display format
      const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      values.push(cleanId);
      
      const updateQuery = `
        UPDATE escrows 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $' + paramIndex : 'display_id = $' + paramIndex}
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
      
      // Log the update for debugging
      const updatedEscrow = result.rows[0];
      console.log('Updated escrow fields:', {
        zillow_url: updatedEscrow.zillow_url,
        property_image_url: updatedEscrow.property_image_url,
        id: updatedEscrow.id
      });
      
      // Return the raw database row - the frontend handles both formats
      res.json({
        success: true,
        data: updatedEscrow,
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
      
      // Validate required field
      if (!escrowData.property_address) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'property_address is required'
          }
        });
      }
      
      // After migration, the database will automatically:
      // - Generate UUID for id
      // - Generate numeric_id from sequence
      // - Generate display_id via trigger (ESCROW-2025-0001 format)
      
      // Build dynamic query with only provided fields
      const fields = ['property_address'];
      const values = [escrowData.property_address];
      const placeholders = ['$1'];
      let paramIndex = 2;
      
      // Add optional fields if provided
      const optionalFields = {
        city: escrowData.city,
        state: escrowData.state,
        zip_code: escrowData.zip_code,
        escrow_status: escrowData.escrow_status,
        purchase_price: escrowData.purchase_price,
        earnest_money_deposit: escrowData.earnest_money_deposit,
        commission_percentage: escrowData.commission_percentage,
        net_commission: escrowData.net_commission || escrowData.my_commission,
        acceptance_date: escrowData.acceptance_date,
        closing_date: escrowData.closing_date,
        property_type: escrowData.property_type,
        escrow_company: escrowData.escrow_company,
        escrow_officer_name: escrowData.escrow_officer_name,
        escrow_officer_email: escrowData.escrow_officer_email,
        escrow_officer_phone: escrowData.escrow_officer_phone,
        loan_officer_name: escrowData.loan_officer_name,
        loan_officer_email: escrowData.loan_officer_email,
        loan_officer_phone: escrowData.loan_officer_phone,
        title_company: escrowData.title_company,
        transaction_type: escrowData.transaction_type,
        lead_source: escrowData.lead_source
      };
      
      // Add fields that are actually provided
      for (const [field, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null) {
          fields.push(field);
          values.push(value);
          placeholders.push(`$${paramIndex}`);
          paramIndex++;
        }
      }
      
      // Add user info if available
      if (req.user?.id) {
        fields.push('created_by');
        values.push(req.user.id);
        placeholders.push(`$${paramIndex}`);
        paramIndex++;
      }
      
      if (req.user?.teamId) {
        fields.push('team_id');
        values.push(req.user.teamId);
        placeholders.push(`$${paramIndex}`);
        paramIndex++;
      }
      
      // Add timestamps
      fields.push('created_at', 'updated_at');
      placeholders.push('NOW()', 'NOW()');
      
      const insertQuery = `
        INSERT INTO escrows (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
      
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
      const acceptanceDate = new Date(newEscrow.acceptance_date || newEscrow.opening_date || new Date());
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
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      
      const storedPeople = result.rows[0].people || {};
      
      // Default contact structure
      const defaultContact = {
        id: null,
        name: null,
        email: null,
        phone: null,
        company: null,
        license: null,
        address: null,
        role: null
      };
      
      // Build structured people object
      const peopleData = {
        // Buyer side
        buyer: storedPeople.buyer || defaultContact,
        buyerAgent: storedPeople.buyerAgent || defaultContact,
        buyerBroker: storedPeople.buyerBroker || defaultContact,
        
        // Seller side
        seller: storedPeople.seller || defaultContact,
        sellerAgent: storedPeople.sellerAgent || defaultContact,
        sellerBroker: storedPeople.sellerBroker || defaultContact,
        
        // Transaction professionals
        escrowOfficer: storedPeople.escrowOfficer || defaultContact,
        titleOfficer: storedPeople.titleOfficer || defaultContact,
        lender: storedPeople.lender || defaultContact,
        loanOfficer: storedPeople.loanOfficer || defaultContact,
        
        // Inspectors
        homeInspector: storedPeople.homeInspector || defaultContact,
        termiteInspector: storedPeople.termiteInspector || defaultContact,
        roofInspector: storedPeople.roofInspector || defaultContact,
        poolInspector: storedPeople.poolInspector || defaultContact,
        
        // Other professionals
        appraiser: storedPeople.appraiser || defaultContact,
        contractor: storedPeople.contractor || defaultContact,
        homeWarrantyRep: storedPeople.homeWarrantyRep || defaultContact,
        
        // Transaction coordinator (check if we need to get from escrow table)
        transactionCoordinator: storedPeople.transactionCoordinator || defaultContact,
        
        // Include any additional people from stored data
        ...Object.keys(storedPeople).reduce((acc, key) => {
          // Only include keys that aren't already defined above
          const predefinedKeys = [
            'buyer', 'buyerAgent', 'buyerBroker',
            'seller', 'sellerAgent', 'sellerBroker',
            'escrowOfficer', 'titleOfficer', 'lender', 'loanOfficer',
            'homeInspector', 'termiteInspector', 'roofInspector', 'poolInspector',
            'appraiser', 'contractor', 'homeWarrantyRep', 'transactionCoordinator'
          ];
          
          if (!predefinedKeys.includes(key)) {
            acc[key] = storedPeople[key];
          }
          return acc;
        }, {})
      };
      
      res.json({
        success: true,
        data: peopleData
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
      
      // Detect if ID is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get the full escrow record
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      
      // Use the same response builder as getEscrowById
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      // Return just the timeline section
      res.json({
        success: true,
        data: fullResponse.timeline
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
      
      // Detect if ID is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get the full escrow record
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      
      // Use the same response builder as getEscrowById
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      // Return just the financials section
      res.json({
        success: true,
        data: fullResponse.financials
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
      
      // Detect if ID is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get the full escrow record
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      
      // Use the same response builder as getEscrowById
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      // Return the checklist sections with the correct format
      res.json({
        success: true,
        data: {
          'checklist-loan': fullResponse['checklist-loan'],
          'checklist-house': fullResponse['checklist-house'],
          'checklist-admin': fullResponse['checklist-admin']
        }
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
   * Get loan checklist only
   */
  static async getEscrowChecklistLoan(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      res.json({
        success: true,
        data: fullResponse['checklist-loan']
      });
      
    } catch (error) {
      console.error('Error fetching loan checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch loan checklist'
        }
      });
    }
  }

  /**
   * Update loan checklist
   */
  static async updateEscrowChecklistLoan(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get current checklists
      const getQuery = `
        SELECT checklists FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const getResult = await pool.query(getQuery, [id]);
      
      if (getResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Update loan checklist
      let checklists = getResult.rows[0].checklists || {};
      checklists.loan = { ...checklists.loan, ...updates };
      
      const updateQuery = `
        UPDATE escrows 
        SET checklists = $1, updated_at = NOW()
        WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [JSON.stringify(checklists), id]);
      const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);
      
      res.json({
        success: true,
        data: fullResponse['checklist-loan'],
        message: 'Loan checklist updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating loan checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update loan checklist'
        }
      });
    }
  }

  /**
   * Get house checklist only
   */
  static async getEscrowChecklistHouse(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      res.json({
        success: true,
        data: fullResponse['checklist-house']
      });
      
    } catch (error) {
      console.error('Error fetching house checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch house checklist'
        }
      });
    }
  }

  /**
   * Update house checklist
   */
  static async updateEscrowChecklistHouse(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get current checklists
      const getQuery = `
        SELECT checklists FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const getResult = await pool.query(getQuery, [id]);
      
      if (getResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Update house checklist
      let checklists = getResult.rows[0].checklists || {};
      checklists.house = { ...checklists.house, ...updates };
      
      const updateQuery = `
        UPDATE escrows 
        SET checklists = $1, updated_at = NOW()
        WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [JSON.stringify(checklists), id]);
      const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);
      
      res.json({
        success: true,
        data: fullResponse['checklist-house'],
        message: 'House checklist updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating house checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update house checklist'
        }
      });
    }
  }

  /**
   * Get admin checklist only
   */
  static async getEscrowChecklistAdmin(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      res.json({
        success: true,
        data: fullResponse['checklist-admin']
      });
      
    } catch (error) {
      console.error('Error fetching admin checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch admin checklist'
        }
      });
    }
  }

  /**
   * Update admin checklist
   */
  static async updateEscrowChecklistAdmin(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get current checklists
      const getQuery = `
        SELECT checklists FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const getResult = await pool.query(getQuery, [id]);
      
      if (getResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Update admin checklist
      let checklists = getResult.rows[0].checklists || {};
      checklists.admin = { ...checklists.admin, ...updates };
      
      const updateQuery = `
        UPDATE escrows 
        SET checklists = $1, updated_at = NOW()
        WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [JSON.stringify(checklists), id]);
      const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);
      
      res.json({
        success: true,
        data: fullResponse['checklist-admin'],
        message: 'Admin checklist updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating admin checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update admin checklist'
        }
      });
    }
  }

  /**
   * Update escrow documents
   */
  static async updateEscrowDocuments(req, res) {
    try {
      const { id } = req.params;
      const documents = req.body;
      
      if (!Array.isArray(documents)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Documents must be an array'
          }
        });
      }
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const updateQuery = `
        UPDATE escrows 
        SET documents = $1, updated_at = NOW()
        WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [JSON.stringify(documents), id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);
      
      res.json({
        success: true,
        data: fullResponse.documents,
        message: 'Documents updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating documents:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update documents'
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
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
   * Get escrow details (core information only)
   */
  static async getEscrowDetails(req, res) {
    try {
      const { id } = req.params;
      
      // Detect if ID is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Get the full escrow record
      const query = `
        SELECT * FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      
      // Use the same response builder as getEscrowById
      const fullResponse = buildRestructuredEscrowResponse(escrow);
      
      // Return just the details section
      res.json({
        success: true,
        data: fullResponse.details
      });
      
    } catch (error) {
      console.error('Error fetching escrow details:', error);
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
   * Update escrow details
   */
  static async updateEscrowDetails(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Map details fields to database columns
      const fieldMapping = {
        escrowNumber: 'display_id',
        propertyAddress: 'property_address',
        propertyImage: 'property_image_url',
        zillowUrl: 'zillow_url',
        escrowStatus: 'escrow_status',
        purchasePrice: 'purchase_price',
        earnestMoneyDeposit: 'earnest_money_deposit',
        downPayment: 'down_payment',
        loanAmount: 'loan_amount',
        myCommission: 'my_commission',
        scheduledCoeDate: 'closing_date',
        escrowCompany: 'escrow_company',
        escrowOfficerName: 'escrow_officer_name',
        escrowOfficerEmail: 'escrow_officer_email',
        escrowOfficerPhone: 'escrow_officer_phone',
        titleCompany: 'title_company',
        transactionType: 'transaction_type',
        leadSource: 'lead_source'
      };
      
      // Build update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      Object.keys(updates).forEach(key => {
        if (fieldMapping[key] && key !== 'id' && key !== 'escrowNumber') {
          updateFields.push(`${fieldMapping[key]} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No valid fields to update'
          }
        });
      }
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      values.push(id);
      
      const updateQuery = `
        UPDATE escrows 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE ${isUUID ? 'id = $' + paramIndex : 'display_id = $' + paramIndex}
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Return updated details using the response builder
      const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);
      
      res.json({
        success: true,
        data: fullResponse.details,
        message: 'Escrow details updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update escrow details'
        }
      });
    }
  }

  /**
   * Get escrow property details
   */
  static async getEscrowPropertyDetails(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT 
          property_address, property_type, purchase_price,
          bedrooms, bathrooms, square_feet, lot_size_sqft, year_built, garage_spaces, stories,
          pool, spa, view_type, architectural_style, property_condition, zoning,
          apn, mls_number, county, city, state, zip_code, subdivision, cross_streets,
          latitude, longitude, hoa_fee, hoa_frequency, hoa_name, gated_community, senior_community,
          property_features, property_images, list_price, list_date, days_on_market,
          previous_list_price, original_list_price
        FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
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
      const storedFeatures = escrow.property_features || {};
      const storedImages = escrow.property_images || [];
      
      const propertyDetails = {
        // Basic property info
        address: escrow.property_address || null,
        city: escrow.city || null,
        state: escrow.state || 'CA',
        zipCode: escrow.zip_code || null,
        county: escrow.county || null,
        
        // Property characteristics
        propertyType: escrow.property_type || 'Single Family',
        bedrooms: escrow.bedrooms || null,
        bathrooms: escrow.bathrooms || null,
        squareFeet: escrow.square_feet || null,
        lotSizeSqft: escrow.lot_size_sqft || null,
        yearBuilt: escrow.year_built || null,
        stories: escrow.stories || null,
        garageSpaces: escrow.garage_spaces || null,
        
        // Property features
        pool: escrow.pool || false,
        spa: escrow.spa || false,
        viewType: escrow.view_type || null,
        architecturalStyle: escrow.architectural_style || null,
        propertyCondition: escrow.property_condition || null,
        zoning: escrow.zoning || null,
        
        // Location details
        subdivision: escrow.subdivision || null,
        crossStreets: escrow.cross_streets || null,
        latitude: escrow.latitude || null,
        longitude: escrow.longitude || null,
        
        // Identifiers
        apn: escrow.apn || null,
        mlsNumber: escrow.mls_number || null,
        
        // HOA information
        hoaFee: escrow.hoa_fee || null,
        hoaFrequency: escrow.hoa_frequency || null,
        hoaName: escrow.hoa_name || null,
        gatedCommunity: escrow.gated_community || false,
        seniorCommunity: escrow.senior_community || false,
        
        // Listing information
        listPrice: escrow.list_price || null,
        listDate: escrow.list_date || null,
        daysOnMarket: escrow.days_on_market || null,
        previousListPrice: escrow.previous_list_price || null,
        originalListPrice: escrow.original_list_price || null,
        
        // Additional features from JSONB
        features: storedFeatures,
        images: storedImages,
        
        // Pricing
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        pricePerSqft: escrow.square_feet && escrow.purchase_price ? 
          Math.round(parseFloat(escrow.purchase_price) / escrow.square_feet) : null
      };
      
      res.json({
        success: true,
        data: propertyDetails
      });
      
    } catch (error) {
      console.error('Error fetching escrow property details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow property details'
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
      
      const isUUIDFormat = /^[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        UPDATE escrows
        SET people = $2, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
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
      
      const isUUIDFormat = /^[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        UPDATE escrows
        SET checklists = $2, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
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

  /**
   * Update escrow property details
   */
  static async updateEscrowPropertyDetails(req, res) {
    try {
      const { id } = req.params;
      const propertyDetails = req.body;
      
      // Clean the ID
      let cleanId = id;
      if (id.startsWith('escrow-')) {
        cleanId = id.substring(7);
      }
      
      const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      
      // Map frontend property field names to database column names
      const propertyFieldMapping = {
        'pool': 'pool',
        'spa': 'spa',
        'gatedCommunity': 'gated_community',
        'gated_community': 'gated_community',
        'seniorCommunity': 'senior_community',
        'senior_community': 'senior_community',
        'bedrooms': 'bedrooms',
        'bathrooms': 'bathrooms',
        'squareFeet': 'square_feet',
        'square_feet': 'square_feet',
        'yearBuilt': 'year_built',
        'year_built': 'year_built',
        'garageSpaces': 'garage_spaces',
        'garage_spaces': 'garage_spaces',
        'stories': 'stories',
        'lotSize': 'lot_size_sqft',
        'lot_size_sqft': 'lot_size_sqft',
      };
      
      // Build dynamic update query for individual columns
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      Object.keys(propertyDetails).forEach(key => {
        const dbColumn = propertyFieldMapping[key] || key;
        // Only update fields that are actual database columns
        if (dbColumn) {
          updateFields.push(`${dbColumn} = $${paramIndex}`);
          values.push(propertyDetails[key]);
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No valid property fields to update'
          }
        });
      }
      
      values.push(cleanId);
      
      // Update individual property columns
      const updateQuery = `
        UPDATE escrows
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $' + paramIndex : 'display_id = $' + paramIndex}
        RETURNING id, bedrooms, bathrooms, square_feet, pool, spa, 
                  gated_community, senior_community, year_built, 
                  garage_spaces, stories, lot_size_sqft
      `;
      
      const result = await pool.query(updateQuery, values);
      
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
        message: 'Property details updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating property details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update property details'
        }
      });
    }
  }

  /**
   * Update escrow financials
   */
  static async updateEscrowFinancials(req, res) {
    try {
      const { id } = req.params;
      const financials = req.body;
      
      // Clean the ID
      let cleanId = id;
      if (id.startsWith('escrow-')) {
        cleanId = id.substring(7);
      }
      
      const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      
      // First get the current escrow to preserve existing financials
      const getCurrentQuery = `
        SELECT financials 
        FROM escrows 
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
      `;
      
      const currentResult = await pool.query(getCurrentQuery, [cleanId]);
      
      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Merge new financials with existing ones - handle JSON parsing
      let existingFinancials = currentResult.rows[0].financials || {};
      // If it's a string, parse it
      if (typeof existingFinancials === 'string') {
        try {
          existingFinancials = JSON.parse(existingFinancials);
        } catch (e) {
          existingFinancials = {};
        }
      }
      const mergedFinancials = { ...existingFinancials, ...financials };
      
      // Update with merged data
      const updateQuery = `
        UPDATE escrows
        SET financials = $2, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
        RETURNING id, financials
      `;
      
      const result = await pool.query(updateQuery, [cleanId, JSON.stringify(mergedFinancials)]);
      
      res.json({
        success: true,
        data: result.rows[0].financials,
        message: 'Financials updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating financials:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update financials'
        }
      });
    }
  }

  /**
   * Update escrow timeline
   */
  static async updateEscrowTimeline(req, res) {
    try {
      const { id } = req.params;
      const timeline = req.body;
      
      // Clean the ID
      let cleanId = id;
      if (id.startsWith('escrow-')) {
        cleanId = id.substring(7);
      }
      
      const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      
      // First get the current escrow to preserve existing timeline
      const getCurrentQuery = `
        SELECT timeline 
        FROM escrows 
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
      `;
      
      const currentResult = await pool.query(getCurrentQuery, [cleanId]);
      
      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Merge new timeline with existing one - handle JSON parsing
      let existingTimeline = currentResult.rows[0].timeline || {};
      // If it's a string, parse it  
      if (typeof existingTimeline === 'string') {
        try {
          existingTimeline = JSON.parse(existingTimeline);
        } catch (e) {
          existingTimeline = {};
        }
      }
      const mergedTimeline = { ...existingTimeline, ...timeline };
      
      // Update with merged data
      const updateQuery = `
        UPDATE escrows
        SET timeline = $2, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
        RETURNING id, timeline
      `;
      
      const result = await pool.query(updateQuery, [cleanId, JSON.stringify(mergedTimeline)]);
      
      res.json({
        success: true,
        data: result.rows[0].timeline,
        message: 'Timeline updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating timeline:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update timeline'
        }
      });
    }
  }

  /**
   * Get property image from database
   * Returns the cached Zillow image URL or prompts to add one
   */
  static async getEscrowImage(req, res) {
    try {
      const { id } = req.params;
      const pool = require('../config/database').pool;
      
      // Get escrow to find image URL
      const query = `
        SELECT property_image_url, zillow_url, property_address, display_id, id
        FROM escrows 
        WHERE id = $1 OR display_id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).send('Escrow not found');
      }
      
      const escrow = result.rows[0];
      
      // If we have a valid Zillow static image URL, return it
      if (escrow.property_image_url && 
          escrow.property_image_url.includes('zillowstatic.com')) {
        return res.send(escrow.property_image_url);
      }
      
      // If no Zillow URL is set, prompt to add one
      if (!escrow.zillow_url) {
        return res.send('No Zillow URL - please add the Zillow listing URL to this escrow');
      }
      
      // If we have a Zillow URL but no image, provide instructions
      return res.send(`To get the image: 1) Go to https://www.opengraph.xyz/ 2) Paste: ${escrow.zillow_url} 3) Copy the og:image URL 4) Update the property_image_url field`);
      
    } catch (error) {
      console.error('Error in getEscrowImage:', error);
      res.status(500).send('Internal server error');
    }
  }
}

module.exports = SimpleEscrowController;