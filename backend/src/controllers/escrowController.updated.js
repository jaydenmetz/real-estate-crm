const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'realestate_crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});
// Simple logger for testing
const logger = {
  error: (msg, details) => console.error('[ERROR]', msg, details || '')
};
const { validationResult } = require('express-validator');

/**
 * Updated Escrow Controller using the new contact-based structure
 */
class EscrowController {
  /**
   * Get single escrow by ID with all participants from contacts
   * GET /api/v1/escrows/:id
   */
  static async getEscrowById(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      
      // Main escrow query with CTEs for efficient data fetching
      const escrowQuery = `
        WITH escrow_participants AS (
          SELECT 
            ce.escrow_id,
            ce.role,
            ce.is_primary,
            ce.commission_percentage,
            ce.commission_amount,
            ce.commission_notes,
            c.id as contact_id,
            c.first_name,
            c.last_name,
            c.full_name,
            c.email,
            c.phone,
            c.mobile_phone,
            c.company_name,
            c.address_street,
            c.address_city,
            c.address_state,
            c.address_zip,
            a.id as agent_id,
            a.license_number,
            a.license_state,
            a.brokerage_name,
            cl.id as client_id,
            cl.client_type
          FROM contact_escrows ce
          INNER JOIN contacts c ON ce.contact_id = c.id
          LEFT JOIN agents a ON c.id = a.contact_id
          LEFT JOIN clients cl ON c.id = cl.contact_id
          WHERE ce.escrow_id = $1
        ),
        escrow_data AS (
          SELECT 
            e.*,
            u.first_name as created_by_first_name,
            u.last_name as created_by_last_name
          FROM escrows e
          LEFT JOIN users u ON e.created_by = u.id
          WHERE e.id = $1
        )
        SELECT 
          ed.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'role', ep.role,
                'is_primary', ep.is_primary,
                'contact_id', ep.contact_id,
                'first_name', ep.first_name,
                'last_name', ep.last_name,
                'full_name', ep.full_name,
                'email', ep.email,
                'phone', ep.phone,
                'mobile_phone', ep.mobile_phone,
                'company_name', ep.company_name,
                'address', jsonb_build_object(
                  'street', ep.address_street,
                  'city', ep.address_city,
                  'state', ep.address_state,
                  'zip', ep.address_zip
                ),
                'agent_info', CASE 
                  WHEN ep.agent_id IS NOT NULL THEN jsonb_build_object(
                    'agent_id', ep.agent_id,
                    'license_number', ep.license_number,
                    'license_state', ep.license_state,
                    'brokerage_name', ep.brokerage_name,
                    'commission_percentage', ep.commission_percentage,
                    'commission_amount', ep.commission_amount,
                    'commission_notes', ep.commission_notes
                  )
                  ELSE NULL
                END,
                'client_info', CASE 
                  WHEN ep.client_id IS NOT NULL THEN jsonb_build_object(
                    'client_id', ep.client_id,
                    'client_type', ep.client_type
                  )
                  ELSE NULL
                END
              )
            ) FILTER (WHERE ep.contact_id IS NOT NULL),
            '[]'::json
          ) as participants
        FROM escrow_data ed
        LEFT JOIN escrow_participants ep ON ed.id = ep.escrow_id
        GROUP BY 
          ed.id, ed.property_address, ed.escrow_status, ed.purchase_price,
          ed.earnest_money_deposit, ed.down_payment, ed.loan_amount,
          ed.commission_percentage, ed.gross_commission, ed.net_commission,
          ed.acceptance_date, ed.closing_date, ed.property_type,
          ed.lead_source, ed.created_by, ed.team_id, ed.created_at,
          ed.updated_at, ed.deleted_at, ed.created_by_first_name,
          ed.created_by_last_name
      `;

      const escrowResult = await client.query(escrowQuery, [id]);

      if (escrowResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          },
          timestamp: new Date().toISOString()
        });
      }

      const escrow = escrowResult.rows[0];

      // Process participants into structured format
      const participants = escrow.participants || [];
      const buyers = participants.filter(p => p.role === 'buyer');
      const sellers = participants.filter(p => p.role === 'seller');
      const listingAgent = participants.find(p => p.role === 'listing_agent') || null;
      const buyerAgent = participants.find(p => p.role === 'buyer_agent') || null;
      const otherParticipants = participants.filter(p => 
        !['buyer', 'seller', 'listing_agent', 'buyer_agent'].includes(p.role)
      );

      // Fetch checklist items
      const checklistQuery = `
        SELECT id, task, completed, completed_date, notes, created_at
        FROM escrow_checklist
        WHERE escrow_id = $1
        ORDER BY created_at ASC
      `;
      const checklistResult = await client.query(checklistQuery, [id]);

      // Fetch documents - simplified for now
      const documentsResult = { rows: [] }; // Documents table structure needs updating

      // Fetch timeline events
      const timelineQuery = `
        SELECT id, event_type, description, event_date, created_by, created_at
        FROM escrow_timeline
        WHERE escrow_id = $1
        ORDER BY event_date DESC, created_at DESC
      `;
      const timelineResult = await client.query(timelineQuery, [id]);

      // Structure the response
      const response = {
        id: escrow.id,
        property_address: escrow.property_address,
        escrow_status: escrow.escrow_status,
        purchase_price: parseFloat(escrow.purchase_price) || 0,
        earnest_money_deposit: parseFloat(escrow.earnest_money_deposit) || 0,
        down_payment: parseFloat(escrow.down_payment) || 0,
        loan_amount: parseFloat(escrow.loan_amount) || 0,
        commission_percentage: parseFloat(escrow.commission_percentage) || 0,
        gross_commission: parseFloat(escrow.gross_commission) || 0,
        net_commission: parseFloat(escrow.net_commission) || 0,
        acceptance_date: escrow.acceptance_date,
        closing_date: escrow.closing_date,
        property_type: escrow.property_type,
        lead_source: escrow.lead_source,
        
        // Participants
        buyers: buyers,
        sellers: sellers,
        listing_agent: listingAgent,
        buyer_agent: buyerAgent,
        other_participants: otherParticipants,
        
        // Related data
        checklist: checklistResult.rows,
        documents: documentsResult.rows,
        timeline: timelineResult.rows,
        
        // Metadata
        created_by: escrow.created_by ? {
          id: escrow.created_by,
          name: `${escrow.created_by_first_name || ''} ${escrow.created_by_last_name || ''}`.trim()
        } : null,
        created_at: escrow.created_at,
        updated_at: escrow.updated_at
      };

      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error fetching escrow:', {
        error: error.message,
        stack: error.stack,
        escrowId: req.params.id
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow details'
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  }

  /**
   * Get all escrows (list view - minimal data)
   * GET /api/v1/escrows
   */
  static async getAllEscrows(req, res) {
    const client = await pool.connect();
    
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sort = 'closing_date',
        order = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      let whereConditions = ['e.deleted_at IS NULL'];
      let queryParams = [];
      let paramIndex = 1;

      if (status) {
        whereConditions.push(`e.escrow_status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM escrows e
        ${whereClause}
      `;
      const countResult = await client.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Main query for list view (minimal data)
      queryParams.push(limit, offset);
      const listQuery = `
        WITH escrow_summary AS (
          SELECT 
            e.id,
            e.property_address,
            e.escrow_status,
            e.purchase_price,
            e.closing_date,
            e.gross_commission,
            e.created_at,
            e.updated_at,
            -- Get primary buyer and seller names
            (
              SELECT c.full_name
              FROM contact_escrows ce
              JOIN contacts c ON ce.contact_id = c.id
              WHERE ce.escrow_id = e.id 
                AND ce.role = 'buyer' 
                AND ce.is_primary = true
              LIMIT 1
            ) as primary_buyer,
            (
              SELECT c.full_name
              FROM contact_escrows ce
              JOIN contacts c ON ce.contact_id = c.id
              WHERE ce.escrow_id = e.id 
                AND ce.role = 'seller' 
                AND ce.is_primary = true
              LIMIT 1
            ) as primary_seller
          FROM escrows e
          ${whereClause}
          ORDER BY ${sort} ${order.toUpperCase()}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        )
        SELECT * FROM escrow_summary
      `;

      const listResult = await client.query(listQuery, queryParams);

      res.json({
        success: true,
        data: listResult.rows,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          pages: Math.ceil(totalCount / limit),
          limit: parseInt(limit)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error fetching escrows list:', {
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrows'
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  }

  /**
   * Create new escrow with participants
   * POST /api/v1/escrows
   */
  static async createEscrow(req, res) {
    const client = await pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array()
          }
        });
      }

      await client.query('BEGIN');

      const {
        property_address,
        purchase_price,
        closing_date,
        participants = [],
        ...otherData
      } = req.body;

      // Create the escrow
      const escrowQuery = `
        INSERT INTO escrows (
          id, property_address, purchase_price, closing_date,
          escrow_status, earnest_money_deposit, down_payment,
          loan_amount, commission_percentage, gross_commission,
          net_commission, acceptance_date, property_type,
          lead_source, created_by, team_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *
      `;

      const escrowId = `ESC-${Date.now()}`;
      const escrowValues = [
        escrowId,
        property_address,
        purchase_price,
        closing_date,
        otherData.escrow_status || 'Active',
        otherData.earnest_money_deposit || 0,
        otherData.down_payment || 0,
        otherData.loan_amount || 0,
        otherData.commission_percentage || 0,
        otherData.gross_commission || 0,
        otherData.net_commission || 0,
        otherData.acceptance_date || new Date(),
        otherData.property_type || 'Single Family',
        otherData.lead_source || 'Direct',
        req.user?.id || null,
        req.team?.id || null
      ];

      const escrowResult = await client.query(escrowQuery, escrowValues);
      const newEscrow = escrowResult.rows[0];

      // Link participants
      for (const participant of participants) {
        const linkQuery = `
          INSERT INTO contact_escrows (
            contact_id, escrow_id, role, is_primary,
            commission_percentage, commission_amount, commission_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await client.query(linkQuery, [
          participant.contact_id,
          escrowId,
          participant.role,
          participant.is_primary || false,
          participant.commission_percentage || null,
          participant.commission_amount || null,
          participant.commission_notes || null
        ]);
      }

      await client.query('COMMIT');

      // Fetch the complete escrow data
      const completeEscrow = await this.getEscrowById(
        { params: { id: escrowId } },
        { json: (data) => data }
      );

      res.status(201).json(completeEscrow);

    } catch (error) {
      await client.query('ROLLBACK');
      
      logger.error('Error creating escrow:', {
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create escrow'
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  }
}

module.exports = EscrowController;