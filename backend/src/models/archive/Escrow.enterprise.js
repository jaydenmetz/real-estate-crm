const { query } = require('../config/database');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const { generateEscrowIds } = require('../utils/idGenerator');
const { emitWebhook } = require('../services/webhook.service');

class Escrow {
  constructor(data) {
    this.id = data.id;
    this.internal_id = data.internal_id;
    this.external_id = data.external_id;
    this.team_id = data.team_id;
    this.user_id = data.user_id;
    this.address = data.address;
    this.status = data.status;
    this.stage = data.stage;
    this.property_type = data.property_type;
    this.listing_mls = data.listing_mls;
    this.purchase_price = data.purchase_price;
    this.original_list_price = data.original_list_price;
    this.total_commission = data.total_commission;
    this.commission_rate = data.commission_rate;
    this.closing_date = data.closing_date;
    this.estimated_closing_date = data.estimated_closing_date;
    this.actual_closing_date = data.actual_closing_date;
    this.acceptance_date = data.acceptance_date;
    this.earnest_money_deposit = data.earnest_money_deposit;
    this.down_payment = data.down_payment;
    this.loan_amount = data.loan_amount;
    this.escrow_company = data.escrow_company;
    this.escrow_officer = data.escrow_officer;
    this.title_company = data.title_company;
    this.lender = data.lender;
    this.transaction_progress = data.transaction_progress || 0;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
    
    // Related data
    this.parties = data.parties || [];
    this.timeline = data.timeline || [];
    this.documents = data.documents || [];
    this.checklist = data.checklist || [];
  }

  // Cache keys
  static cacheKeys = {
    single: (teamId, escrowId) => `escrow:${teamId}:${escrowId}`,
    list: (teamId, userId) => `escrows:${teamId}:${userId}`,
    stats: (teamId) => `stats:escrows:${teamId}`,
  };

  // Cache TTL
  static cacheTTL = {
    single: 300, // 5 minutes
    list: 60, // 1 minute
    stats: 3600, // 1 hour
  };

  // Find all escrows with advanced filtering
  static async findAll(teamId, options = {}) {
    const {
      userId,
      status,
      stage,
      minPrice,
      maxPrice,
      closingDateMin,
      closingDateMax,
      propertyType,
      searchTerm,
      sort = '-closing_date',
      page = 1,
      limit = 50,
      include = []
    } = options;

    try {
      // Check cache first
      const cacheKey = this.cacheKeys.list(teamId, userId);
      const cached = await redis.get(cacheKey);
      if (cached && !Object.keys(options).length) {
        return JSON.parse(cached);
      }

      // Build query
      let conditions = ['e.team_id = $1', 'e.deleted_at IS NULL'];
      let values = [teamId];
      let valueIndex = 2;

      if (userId) {
        conditions.push(`e.user_id = $${valueIndex}`);
        values.push(userId);
        valueIndex++;
      }

      if (status) {
        const statuses = Array.isArray(status) ? status : status.split(',');
        conditions.push(`e.status = ANY($${valueIndex})`);
        values.push(statuses);
        valueIndex++;
      }

      if (stage) {
        conditions.push(`e.stage = $${valueIndex}`);
        values.push(stage);
        valueIndex++;
      }

      if (minPrice) {
        conditions.push(`e.purchase_price >= $${valueIndex}`);
        values.push(minPrice);
        valueIndex++;
      }

      if (maxPrice) {
        conditions.push(`e.purchase_price <= $${valueIndex}`);
        values.push(maxPrice);
        valueIndex++;
      }

      if (closingDateMin) {
        conditions.push(`e.closing_date >= $${valueIndex}`);
        values.push(closingDateMin);
        valueIndex++;
      }

      if (closingDateMax) {
        conditions.push(`e.closing_date <= $${valueIndex}`);
        values.push(closingDateMax);
        valueIndex++;
      }

      if (propertyType) {
        conditions.push(`e.property_type = $${valueIndex}`);
        values.push(propertyType);
        valueIndex++;
      }

      if (searchTerm) {
        conditions.push(`e.search_vector @@ plainto_tsquery('english', $${valueIndex})`);
        values.push(searchTerm);
        valueIndex++;
      }

      // Parse sort
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
      const validSortFields = ['closing_date', 'purchase_price', 'created_at', 'transaction_progress'];
      const orderBy = validSortFields.includes(sortField) 
        ? `e.${sortField} ${sortOrder}` 
        : 'e.closing_date DESC';

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM escrows e
        WHERE ${conditions.join(' AND ')}
      `;

      const countResult = await query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Main query
      const offset = (page - 1) * limit;
      const mainQuery = `
        SELECT 
          e.*,
          json_agg(DISTINCT jsonb_build_object(
            'id', p.id,
            'party_type', p.party_type,
            'name', p.name,
            'email', p.email,
            'phone', p.phone
          )) FILTER (WHERE p.id IS NOT NULL) as parties,
          COUNT(DISTINCT d.id) as document_count,
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks
        FROM escrows e
        LEFT JOIN escrow_parties p ON p.escrow_id = e.id
        LEFT JOIN escrow_documents d ON d.escrow_id = e.id
        LEFT JOIN escrow_timeline t ON t.escrow_id = e.id
        WHERE ${conditions.join(' AND ')}
        GROUP BY e.id
        ORDER BY ${orderBy}
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;

      values.push(limit, offset);
      const result = await query(mainQuery, values);

      // Load additional includes if requested
      const escrows = await Promise.all(
        result.rows.map(async (row) => {
          const escrow = new Escrow(row);
          
          if (include.includes('timeline')) {
            escrow.timeline = await this.getTimeline(row.id);
          }
          
          if (include.includes('documents')) {
            escrow.documents = await this.getDocuments(row.id);
          }
          
          if (include.includes('checklist')) {
            escrow.checklist = await this.getChecklist(row.id);
          }
          
          return escrow;
        })
      );

      const response = {
        escrows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };

      // Cache the result
      if (!Object.keys(options).length) {
        await redis.setex(cacheKey, this.cacheTTL.list, JSON.stringify(response));
      }

      return response;
    } catch (error) {
      logger.error('Error finding escrows:', error);
      throw error;
    }
  }

  // Find single escrow by ID
  static async findById(teamId, escrowId) {
    try {
      // Check cache first
      const cacheKey = this.cacheKeys.single(teamId, escrowId);
      const cached = await redis.get(cacheKey);
      if (cached) {
        return new Escrow(JSON.parse(cached));
      }

      const result = await query(
        `
        SELECT e.*
        FROM escrows e
        WHERE e.team_id = $1 
          AND (e.id = $2 OR e.internal_id = $2 OR e.external_id = $2)
          AND e.deleted_at IS NULL
        `,
        [teamId, escrowId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const escrow = new Escrow(result.rows[0]);
      
      // Load related data
      escrow.parties = await this.getParties(escrow.id);
      escrow.timeline = await this.getTimeline(escrow.id);
      escrow.documents = await this.getDocuments(escrow.id);
      escrow.checklist = await this.getChecklist(escrow.id);

      // Cache the result
      await redis.setex(cacheKey, this.cacheTTL.single, JSON.stringify(escrow));

      return escrow;
    } catch (error) {
      logger.error('Error finding escrow by ID:', error);
      throw error;
    }
  }

  // Create new escrow
  static async create(teamId, userId, data) {
    const client = await query.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Generate IDs
      const { internal_id, external_id } = await generateEscrowIds(teamId);
      
      // Insert escrow
      const escrowResult = await client.query(
        `
        INSERT INTO escrows (
          internal_id, external_id, team_id, user_id, address,
          status, stage, property_type, listing_mls,
          purchase_price, original_list_price, total_commission, commission_rate,
          closing_date, estimated_closing_date, acceptance_date,
          earnest_money_deposit, down_payment, loan_amount,
          escrow_company, escrow_officer, title_company, lender,
          transaction_progress, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25
        ) RETURNING *
        `,
        [
          internal_id, external_id, teamId, userId, JSON.stringify(data.address),
          data.status || 'active', data.stage || 'new', data.property_type, data.listing_mls,
          data.purchase_price, data.original_list_price, data.total_commission, data.commission_rate,
          data.closing_date, data.estimated_closing_date, data.acceptance_date,
          data.earnest_money_deposit, data.down_payment, data.loan_amount,
          data.escrow_company, data.escrow_officer, data.title_company, data.lender,
          data.transaction_progress || 0, data.notes
        ]
      );

      const escrow = new Escrow(escrowResult.rows[0]);

      // Insert parties
      if (data.parties && data.parties.length > 0) {
        for (const party of data.parties) {
          await client.query(
            `
            INSERT INTO escrow_parties (escrow_id, party_type, name, email, phone, company, license_number, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
              escrow.id, party.party_type, party.name, party.email, 
              party.phone, party.company, party.license_number, 
              JSON.stringify(party.metadata || {})
            ]
          );
        }
      }

      // Create initial timeline events
      await this.createInitialTimeline(client, escrow.id, data);

      // Create default checklist
      await this.createDefaultChecklist(client, escrow.id, data.property_type);

      await client.query('COMMIT');

      // Clear cache
      await this.clearCache(teamId);

      // Emit webhook event
      await emitWebhook(teamId, 'escrow.created', {
        escrow: {
          id: escrow.id,
          internal_id: escrow.internal_id,
          external_id: escrow.external_id,
          address: escrow.address,
          status: escrow.status,
          purchase_price: escrow.purchase_price
        }
      });

      // Load full escrow data
      return await this.findById(teamId, escrow.id);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating escrow:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update escrow
  static async update(teamId, escrowId, updates) {
    const client = await query.getClient();
    
    try {
      await client.query('BEGIN');

      // Get current escrow
      const current = await this.findById(teamId, escrowId);
      if (!current) {
        throw new Error('Escrow not found');
      }

      // Build update query
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      const allowedFields = [
        'address', 'status', 'stage', 'property_type', 'listing_mls',
        'purchase_price', 'original_list_price', 'total_commission', 'commission_rate',
        'closing_date', 'estimated_closing_date', 'actual_closing_date', 'acceptance_date',
        'earnest_money_deposit', 'down_payment', 'loan_amount',
        'escrow_company', 'escrow_officer', 'title_company', 'lender',
        'transaction_progress', 'notes'
      ];

      for (const field of allowedFields) {
        if (updates.hasOwnProperty(field)) {
          updateFields.push(`${field} = $${valueIndex}`);
          values.push(field === 'address' ? JSON.stringify(updates[field]) : updates[field]);
          valueIndex++;
        }
      }

      if (updateFields.length > 0) {
        values.push(teamId, escrowId);
        const updateQuery = `
          UPDATE escrows 
          SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE team_id = $${valueIndex} 
            AND (id = $${valueIndex + 1} OR internal_id = $${valueIndex + 1} OR external_id = $${valueIndex + 1})
            AND deleted_at IS NULL
          RETURNING *
        `;

        await client.query(updateQuery, values);
      }

      // Update parties if provided
      if (updates.parties) {
        // Delete existing parties
        await client.query('DELETE FROM escrow_parties WHERE escrow_id = $1', [current.id]);
        
        // Insert new parties
        for (const party of updates.parties) {
          await client.query(
            `
            INSERT INTO escrow_parties (escrow_id, party_type, name, email, phone, company, license_number, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
              current.id, party.party_type, party.name, party.email, 
              party.phone, party.company, party.license_number, 
              JSON.stringify(party.metadata || {})
            ]
          );
        }
      }

      // Add timeline event for significant changes
      if (updates.status && updates.status !== current.status) {
        await client.query(
          `
          INSERT INTO escrow_timeline (escrow_id, event_type, event_date, description, status)
          VALUES ($1, $2, CURRENT_TIMESTAMP, $3, 'completed')
          `,
          [current.id, 'status_change', `Status changed from ${current.status} to ${updates.status}`]
        );
      }

      await client.query('COMMIT');

      // Clear cache
      await this.clearCache(teamId, escrowId);

      // Emit webhook event
      await emitWebhook(teamId, 'escrow.updated', {
        escrow: {
          id: current.id,
          internal_id: current.internal_id,
          external_id: current.external_id,
          changes: updates
        }
      });

      // Return updated escrow
      return await this.findById(teamId, escrowId);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating escrow:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Soft delete escrow
  static async delete(teamId, escrowId) {
    try {
      const result = await query(
        `
        UPDATE escrows 
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE team_id = $1 
          AND (id = $2 OR internal_id = $2 OR external_id = $2)
          AND deleted_at IS NULL
        RETURNING id, internal_id, external_id
        `,
        [teamId, escrowId]
      );

      if (result.rows.length === 0) {
        throw new Error('Escrow not found');
      }

      // Clear cache
      await this.clearCache(teamId, escrowId);

      // Emit webhook event
      await emitWebhook(teamId, 'escrow.deleted', {
        escrow: {
          id: result.rows[0].id,
          internal_id: result.rows[0].internal_id,
          external_id: result.rows[0].external_id
        }
      });

      return true;
    } catch (error) {
      logger.error('Error deleting escrow:', error);
      throw error;
    }
  }

  // Batch operations
  static async batch(teamId, userId, operations) {
    const results = [];
    const errors = [];

    for (const [index, op] of operations.entries()) {
      try {
        let result;
        
        switch (op.method) {
          case 'create':
            result = await this.create(teamId, userId, op.data);
            break;
          case 'update':
            result = await this.update(teamId, op.id, op.data);
            break;
          case 'delete':
            await this.delete(teamId, op.id);
            result = { success: true, id: op.id };
            break;
          default:
            throw new Error(`Unknown operation method: ${op.method}`);
        }
        
        results.push({ index, success: true, data: result });
      } catch (error) {
        errors.push({ index, success: false, error: error.message });
      }
    }

    return { results, errors };
  }

  // Get parties for an escrow
  static async getParties(escrowId) {
    const result = await query(
      'SELECT * FROM escrow_parties WHERE escrow_id = $1 ORDER BY party_type, name',
      [escrowId]
    );
    return result.rows;
  }

  // Get timeline for an escrow
  static async getTimeline(escrowId) {
    const result = await query(
      'SELECT * FROM escrow_timeline WHERE escrow_id = $1 ORDER BY event_date DESC',
      [escrowId]
    );
    return result.rows;
  }

  // Get documents for an escrow
  static async getDocuments(escrowId) {
    const result = await query(
      'SELECT * FROM escrow_documents WHERE escrow_id = $1 ORDER BY created_at DESC',
      [escrowId]
    );
    return result.rows;
  }

  // Get checklist for an escrow
  static async getChecklist(escrowId) {
    const result = await query(
      'SELECT * FROM escrow_checklist WHERE escrow_id = $1 ORDER BY display_order, item_label',
      [escrowId]
    );
    return result.rows;
  }

  // Update checklist item
  static async updateChecklistItem(teamId, escrowId, itemKey, updates) {
    try {
      const result = await query(
        `
        UPDATE escrow_checklist
        SET is_completed = $1, completed_at = $2, completed_by = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
        WHERE escrow_id = (
          SELECT id FROM escrows 
          WHERE team_id = $5 
            AND (id = $6 OR internal_id = $6 OR external_id = $6)
            AND deleted_at IS NULL
        ) AND item_key = $7
        RETURNING *
        `,
        [
          updates.is_completed,
          updates.is_completed ? new Date() : null,
          updates.completed_by,
          updates.notes,
          teamId,
          escrowId,
          itemKey
        ]
      );

      if (result.rows.length === 0) {
        throw new Error('Checklist item not found');
      }

      // Clear cache
      await this.clearCache(teamId, escrowId);

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating checklist item:', error);
      throw error;
    }
  }

  // Create initial timeline events
  static async createInitialTimeline(client, escrowId, data) {
    const events = [
      {
        event_type: 'escrow_opened',
        event_date: new Date(),
        description: 'Escrow opened',
        status: 'completed'
      }
    ];

    if (data.acceptance_date) {
      events.push({
        event_type: 'offer_accepted',
        event_date: data.acceptance_date,
        description: 'Offer accepted',
        status: 'completed'
      });
    }

    // Add future milestones
    const milestones = [
      { days: 3, type: 'earnest_money_due', description: 'Earnest money deposit due' },
      { days: 10, type: 'inspection_deadline', description: 'Inspection deadline' },
      { days: 17, type: 'appraisal_deadline', description: 'Appraisal deadline' },
      { days: 21, type: 'loan_contingency', description: 'Loan contingency deadline' }
    ];

    const baseDate = data.acceptance_date ? new Date(data.acceptance_date) : new Date();
    
    for (const milestone of milestones) {
      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() + milestone.days);
      
      events.push({
        event_type: milestone.type,
        event_date: eventDate,
        description: milestone.description,
        status: 'pending'
      });
    }

    // Add closing date event
    if (data.closing_date) {
      events.push({
        event_type: 'closing_date',
        event_date: data.closing_date,
        description: 'Scheduled closing',
        status: 'pending'
      });
    }

    // Insert all events
    for (const event of events) {
      await client.query(
        `
        INSERT INTO escrow_timeline (escrow_id, event_type, event_date, description, status)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [escrowId, event.event_type, event.event_date, event.description, event.status]
      );
    }
  }

  // Create default checklist
  static async createDefaultChecklist(client, escrowId, propertyType) {
    const defaultItems = [
      { key: 'earnest_money_deposited', label: 'Earnest Money Deposited', category: 'financial', order: 1 },
      { key: 'purchase_agreement_signed', label: 'Purchase Agreement Signed', category: 'documents', order: 2 },
      { key: 'disclosures_received', label: 'Disclosures Received', category: 'documents', order: 3 },
      { key: 'inspection_ordered', label: 'Inspection Ordered', category: 'inspections', order: 4 },
      { key: 'inspection_completed', label: 'Inspection Completed', category: 'inspections', order: 5 },
      { key: 'inspection_response', label: 'Inspection Response', category: 'inspections', order: 6 },
      { key: 'appraisal_ordered', label: 'Appraisal Ordered', category: 'financing', order: 7 },
      { key: 'appraisal_completed', label: 'Appraisal Completed', category: 'financing', order: 8 },
      { key: 'loan_approved', label: 'Loan Approved', category: 'financing', order: 9 },
      { key: 'insurance_ordered', label: 'Insurance Ordered', category: 'insurance', order: 10 },
      { key: 'title_ordered', label: 'Title Ordered', category: 'title', order: 11 },
      { key: 'title_received', label: 'Title Report Received', category: 'title', order: 12 },
      { key: 'final_walkthrough', label: 'Final Walk-through', category: 'closing', order: 13 },
      { key: 'closing_docs_signed', label: 'Closing Documents Signed', category: 'closing', order: 14 },
      { key: 'keys_delivered', label: 'Keys Delivered', category: 'closing', order: 15 }
    ];

    // Add property type specific items
    if (propertyType === 'Condo' || propertyType === 'Townhouse') {
      defaultItems.push({
        key: 'hoa_docs_received',
        label: 'HOA Documents Received',
        category: 'documents',
        order: 3.5
      });
    }

    // Sort by order
    defaultItems.sort((a, b) => a.order - b.order);

    // Insert checklist items
    for (const item of defaultItems) {
      await client.query(
        `
        INSERT INTO escrow_checklist (escrow_id, item_key, item_label, category, display_order)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [escrowId, item.key, item.label, item.category, item.order]
      );
    }
  }

  // Clear cache
  static async clearCache(teamId, escrowId = null) {
    try {
      if (escrowId) {
        await redis.del(this.cacheKeys.single(teamId, escrowId));
      }
      
      // Clear list caches
      const pattern = `escrows:${teamId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      // Clear stats cache
      await redis.del(this.cacheKeys.stats(teamId));
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }

  // Get statistics
  static async getStats(teamId) {
    try {
      // Check cache first
      const cacheKey = this.cacheKeys.stats(teamId);
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await query(
        `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_count,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'closed' AND actual_closing_date >= DATE_TRUNC('year', CURRENT_DATE)) as closed_ytd,
          COUNT(*) FILTER (WHERE status = 'closed' AND actual_closing_date >= DATE_TRUNC('month', CURRENT_DATE)) as closed_this_month,
          AVG(purchase_price) FILTER (WHERE status = 'closed' AND actual_closing_date >= DATE_TRUNC('year', CURRENT_DATE)) as avg_sale_price,
          SUM(purchase_price) FILTER (WHERE status IN ('active', 'pending')) as pipeline_value,
          AVG(EXTRACT(DAY FROM (actual_closing_date - acceptance_date))) FILTER (WHERE status = 'closed' AND actual_closing_date >= DATE_TRUNC('year', CURRENT_DATE)) as avg_days_to_close
        FROM escrows
        WHERE team_id = $1 AND deleted_at IS NULL
        `,
        [teamId]
      );

      const stats = {
        active_count: parseInt(result.rows[0].active_count) || 0,
        pending_count: parseInt(result.rows[0].pending_count) || 0,
        closed_ytd: parseInt(result.rows[0].closed_ytd) || 0,
        closed_this_month: parseInt(result.rows[0].closed_this_month) || 0,
        avg_sale_price: parseFloat(result.rows[0].avg_sale_price) || 0,
        pipeline_value: parseFloat(result.rows[0].pipeline_value) || 0,
        avg_days_to_close: parseInt(result.rows[0].avg_days_to_close) || 0
      };

      // Cache the result
      await redis.setex(cacheKey, this.cacheTTL.stats, JSON.stringify(stats));

      return stats;
    } catch (error) {
      logger.error('Error getting escrow stats:', error);
      throw error;
    }
  }
}

module.exports = Escrow;