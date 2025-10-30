const BaseDomainService = require('../../../shared/services/BaseDomainService');
const { pool } = require('../../../config/database');
const { detectSchema } = require('../../../modules/escrows/services/schema.service');
const { buildCommissionField } = require('../../../modules/escrows/services/commission.service');
const { buildOwnershipWhereClauseWithAlias } = require('../../../helpers/ownership.helper');
const websocketService = require('../../../services/websocket.service');
const NotificationService = require('../../../services/notification.service');

/**
 * EscrowsService
 * Enhanced escrows service extending BaseDomainService
 * Wraps existing escrows business logic with domain service architecture
 */
class EscrowsService extends BaseDomainService {
  constructor() {
    super('escrows', 'EscrowsService');
  }

  /**
   * Override buildQuery to add escrow-specific filters
   */
  buildQuery(filters) {
    const query = super.buildQuery(filters);

    // Add escrow-specific filters
    if (filters.status) {
      query.escrow_status = filters.status;
      delete query.status; // Remove base class status, use escrow_status instead
    }

    if (filters.propertyType) {
      query.property_type = filters.propertyType;
    }

    if (filters.closingDateStart || filters.closingDateEnd) {
      query.closingDateRange = {
        start: filters.closingDateStart,
        end: filters.closingDateEnd
      };
    }

    return query;
  }

  /**
   * Override buildWhereClause to handle escrow-specific fields
   */
  buildWhereClause(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Soft delete filter (conditional based on includeArchived/onlyArchived)
    if (query.onlyArchived === 'true' || query.onlyArchived === true) {
      // Show ONLY archived items (deleted_at IS NOT NULL)
      conditions.push('deleted_at IS NOT NULL');
    } else if (query.includeArchived === 'true' || query.includeArchived === true) {
      // Show ALL items (both active and archived) - no filter
    } else {
      // Default: Show only active items (deleted_at IS NULL)
      conditions.push('deleted_at IS NULL');
    }

    // Process each query parameter
    Object.keys(query).forEach(key => {
      // Skip archive control parameters
      if (key === 'includeArchived' || key === 'onlyArchived') {
        return;
      }
      if (key === 'dateRange' && query[key]) {
        if (query[key].start) {
          conditions.push(`created_at >= $${paramIndex++}`);
          values.push(query[key].start);
        }
        if (query[key].end) {
          conditions.push(`created_at <= $${paramIndex++}`);
          values.push(query[key].end);
        }
      } else if (key === 'closingDateRange' && query[key]) {
        if (query[key].start) {
          conditions.push(`closing_date >= $${paramIndex++}`);
          values.push(query[key].start);
        }
        if (query[key].end) {
          conditions.push(`closing_date <= $${paramIndex++}`);
          values.push(query[key].end);
        }
      } else if (key === 'search' && query[key]) {
        // Search across property address, city, and display_id
        conditions.push(`(
          property_address ILIKE $${paramIndex}
          OR city ILIKE $${paramIndex}
          OR display_id ILIKE $${paramIndex}
        )`);
        values.push(`%${query[key]}%`);
        paramIndex++;
      } else if (key === 'escrow_status' && query[key]) {
        // Case-insensitive status comparison
        conditions.push(`LOWER(escrow_status) = LOWER($${paramIndex++})`);
        values.push(query[key]);
      } else if (key === 'owner_id' && query[key]) {
        // Scope: my escrows
        conditions.push(`owner_id = $${paramIndex++}`);
        values.push(query[key]);
      } else if (key === 'team_id' && query[key]) {
        // Scope: team escrows
        conditions.push(`team_id = $${paramIndex++}`);
        values.push(query[key]);
      } else if (key === 'broker_id' && query[key]) {
        // Scope: broker escrows
        conditions.push(`broker_id = $${paramIndex++}`);
        values.push(query[key]);
      } else if (query[key] !== undefined) {
        conditions.push(`${key} = $${paramIndex++}`);
        values.push(query[key]);
      }
    });

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    return { whereClause, values };
  }

  /**
   * Enhanced statistics calculation for escrows
   * Includes financial metrics and status breakdown
   */
  async calculateStats(filters) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      // Detect schema for commission field
      const schema = await detectSchema();
      const commissionField = buildCommissionField(schema);

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN escrow_status = 'Active' THEN 1 END) as active,
          COUNT(CASE WHEN escrow_status = 'Pending' THEN 1 END) as pending,
          COUNT(CASE WHEN escrow_status = 'Closed' THEN 1 END) as closed,
          COUNT(CASE WHEN escrow_status = 'Cancelled' THEN 1 END) as cancelled,
          COALESCE(SUM(CASE WHEN escrow_status = 'Active' THEN purchase_price ELSE 0 END), 0) as active_volume,
          COALESCE(SUM(CASE WHEN escrow_status = 'Closed' THEN purchase_price ELSE 0 END), 0) as closed_volume,
          COALESCE(SUM(CASE WHEN escrow_status = 'Closed' THEN ${commissionField} ELSE 0 END), 0) as total_commission
        FROM ${this.tableName}
        ${whereClause}
      `;

      const result = await this.db.query(statsQuery, values);
      const stats = result.rows[0];

      return {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        pending: parseInt(stats.pending) || 0,
        closed: parseInt(stats.closed) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
        activeVolume: parseFloat(stats.active_volume) || 0,
        closedVolume: parseFloat(stats.closed_volume) || 0,
        totalCommission: parseFloat(stats.total_commission) || 0,
        activePercentage: stats.total > 0
          ? Math.round((stats.active / stats.total) * 100)
          : 0,
        closedPercentage: stats.total > 0
          ? Math.round((stats.closed / stats.total) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error('Error calculating escrow stats:', error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        closed: 0,
        cancelled: 0,
        activeVolume: 0,
        closedVolume: 0,
        totalCommission: 0,
        activePercentage: 0,
        closedPercentage: 0
      };
    }
  }

  /**
   * Create new escrow with auto-incrementing display_id
   * Wraps existing createEscrow logic
   */
  async create(data, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate required fields
      if (!data.propertyAddress && !data.property_address) {
        throw new Error('property_address is required');
      }

      const propertyAddress = data.propertyAddress || data.property_address;

      // Generate display_id
      const year = new Date().getFullYear();
      const maxNumberResult = await client.query(
        "SELECT MAX(CAST(SUBSTRING(display_id FROM 'ESC-[0-9]+-([0-9]+)') AS INTEGER)) as max_number FROM escrows WHERE display_id LIKE $1",
        [`ESC-${year}-%`]
      );

      const nextNumber = (maxNumberResult.rows[0]?.max_number || 0) + 1;
      const displayId = `ESC-${year}-${String(nextNumber).padStart(4, '0')}`;

      // Build dynamic insert query
      const fields = ['property_address', 'display_id', 'purchase_price', 'escrow_status'];
      const values = [
        propertyAddress,
        displayId,
        data.purchasePrice || data.purchase_price || 0,
        data.escrowStatus || data.escrow_status || 'Active'
      ];
      const placeholders = ['$1', '$2', '$3', '$4'];
      let paramIndex = 5;

      // Add optional fields
      const optionalFields = {
        city: data.city,
        state: data.state,
        zip_code: data.zipCode || data.zip_code,
        earnest_money_deposit: data.earnest_money_deposit,
        commission_percentage: data.commission_percentage,
        net_commission: data.net_commission || data.my_commission,
        acceptance_date: data.acceptanceDate || data.acceptance_date,
        closing_date: data.closingDate || data.closing_date,
        property_type: data.property_type,
        escrow_company: data.escrow_company,
        escrow_officer_name: data.escrow_officer_name,
        escrow_officer_email: data.escrow_officer_email,
        escrow_officer_phone: data.escrow_officer_phone,
        loan_officer_name: data.loan_officer_name,
        loan_officer_email: data.loan_officer_email,
        loan_officer_phone: data.loan_officer_phone,
        title_company: data.title_company,
        lead_source: data.lead_source,
        team_id: user.team_id,
        broker_id: user.broker_id,
        created_by: user.id
      };

      for (const [field, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null) {
          fields.push(field);
          values.push(value);
          placeholders.push(`$${paramIndex++}`);
        }
      }

      const insertQuery = `
        INSERT INTO escrows (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await client.query(insertQuery, values);
      const newEscrow = result.rows[0];

      await client.query('COMMIT');

      // Emit WebSocket event (3-tier hierarchy)
      const eventData = {
        entityType: 'escrow',
        entityId: newEscrow.id,
        action: 'created',
        data: this.transform(newEscrow)
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }
      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      // Send broker notification
      if (user.broker_id) {
        await NotificationService.createNotification({
          userId: user.broker_id,
          type: 'escrow_created',
          message: `New escrow created: ${propertyAddress}`,
          entityType: 'escrow',
          entityId: newEscrow.id
        });
      }

      return this.transform(newEscrow);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error creating escrow:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update escrow with optimistic locking
   */
  async update(id, data, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get existing escrow to check version
      const existing = await this.findById(id);

      // Check optimistic lock if version provided
      if (data.version !== undefined && existing.version !== data.version) {
        throw new Error('VERSION_CONFLICT: Escrow has been modified by another user');
      }

      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Map of allowed fields (camelCase and snake_case)
      const allowedFields = {
        property_address: data.propertyAddress || data.property_address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode || data.zip_code,
        purchase_price: data.purchasePrice || data.purchase_price,
        earnest_money_deposit: data.earnest_money_deposit,
        commission_percentage: data.commission_percentage,
        net_commission: data.net_commission || data.my_commission,
        acceptance_date: data.acceptanceDate || data.acceptance_date,
        closing_date: data.closingDate || data.closing_date,
        escrow_status: data.escrowStatus || data.escrow_status,
        property_type: data.property_type,
        escrow_company: data.escrow_company,
        escrow_officer_name: data.escrow_officer_name,
        escrow_officer_email: data.escrow_officer_email,
        escrow_officer_phone: data.escrow_officer_phone,
        loan_officer_name: data.loan_officer_name,
        loan_officer_email: data.loan_officer_email,
        loan_officer_phone: data.loan_officer_phone,
        title_company: data.title_company,
        lead_source: data.lead_source
      };

      for (const [field, value] of Object.entries(allowedFields)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${field} = $${paramIndex++}`);
          values.push(value);
        }
      }

      // Add updated_by and increment version
      updateFields.push(`updated_by = $${paramIndex++}`);
      values.push(user.id);
      updateFields.push(`version = version + 1`);
      updateFields.push(`updated_at = NOW()`);

      // Add ID as last parameter
      values.push(id);

      const updateQuery = `
        UPDATE escrows
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Escrow not found or has been deleted');
      }

      const updated = result.rows[0];

      await client.query('COMMIT');

      // Emit WebSocket event
      const eventData = {
        entityType: 'escrow',
        entityId: updated.id,
        action: 'updated',
        data: this.transform(updated)
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }
      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      return this.transform(updated);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error updating escrow:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Archive escrow (soft delete)
   */
  async archive(id, user) {
    try {
      const query = `
        UPDATE escrows
        SET deleted_at = NOW(), deleted_by = $1
        WHERE id = $2
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [user.id, id]);

      if (result.rows.length === 0) {
        throw new Error('Escrow not found or already archived');
      }

      // Emit WebSocket event
      const eventData = {
        entityType: 'escrow',
        entityId: id,
        action: 'archived',
        data: { id }
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return { success: true, id };
    } catch (error) {
      this.logger.error('Error archiving escrow:', error);
      throw error;
    }
  }

  /**
   * Restore archived escrow
   */
  async restore(id, user) {
    try {
      const query = `
        UPDATE escrows
        SET deleted_at = NULL, deleted_by = NULL
        WHERE id = $1
        AND deleted_at IS NOT NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Escrow not found or not archived');
      }

      const restored = this.transform(result.rows[0]);

      // Emit WebSocket event
      const eventData = {
        entityType: 'escrow',
        entityId: id,
        action: 'restored',
        data: restored
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return restored;
    } catch (error) {
      this.logger.error('Error restoring escrow:', error);
      throw error;
    }
  }

  /**
   * Get complete detail page data for escrow
   * Fetches all data needed for detail page in parallel for performance
   * @param {string} escrowId - Escrow ID
   * @param {object} user - Current user
   * @returns {object} Complete detail data (computed, sidebars, widgets, activity)
   */
  async getDetailData(escrowId, user) {
    try {
      // Fetch all data in parallel for performance
      const [
        computed,
        sidebarLeft,
        sidebarRight,
        widgets,
        activityFeed,
        metadata
      ] = await Promise.all([
        this.computeStats(escrowId),
        this.getSidebarLeft(escrowId, user),
        this.getSidebarRight(escrowId, user),
        this.getWidgets(escrowId, user),
        this.getActivityFeed(escrowId, user),
        this.getMetadata(escrowId, user)
      ]);

      return {
        computed,
        sidebar_left: sidebarLeft,
        sidebar_right: sidebarRight,
        widgets,
        activity_feed: activityFeed,
        metadata
      };
    } catch (error) {
      this.logger.error('Error getting detail data:', error);
      throw error;
    }
  }

  /**
   * Compute derived statistics for escrow
   * @param {string} escrowId - Escrow ID
   * @returns {object} Computed fields
   */
  async computeStats(escrowId) {
    try {
      const escrow = await this.findById(escrowId);

      const now = new Date();
      const closingDate = new Date(escrow.closing_date);
      const openingDate = new Date(escrow.opening_date);

      // Calculate days
      const daysUntilClosing = Math.ceil((closingDate - now) / (1000 * 60 * 60 * 24));
      const daysInEscrow = Math.ceil((now - openingDate) / (1000 * 60 * 60 * 24));

      // Calculate financial figures
      const purchasePrice = parseFloat(escrow.purchase_price) || 0;
      const downPaymentPercent = parseFloat(escrow.down_payment_percent) || 20;
      const downPayment = purchasePrice * (downPaymentPercent / 100);
      const loanAmount = purchasePrice - downPayment;
      const ltvRatio = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

      // Commission calculations
      const commissionPercent = parseFloat(escrow.commission_percent) || 3;
      const totalCommission = purchasePrice * (commissionPercent / 100);
      const brokerageSplit = parseFloat(escrow.brokerage_split) || 80;
      const myCommission = totalCommission / 2; // Assuming buyer/seller split
      const netCommission = myCommission * (brokerageSplit / 100);

      // Estimated closing costs (typically 2-3% of purchase price)
      const estimatedClosingCosts = purchasePrice * 0.025;
      const totalCashNeeded = downPayment + estimatedClosingCosts;

      // Progress calculation (placeholder - would be based on checklist completion)
      const progressPercentage = 65; // TODO: Calculate from actual checklist data

      return {
        days_until_closing: daysUntilClosing,
        days_in_escrow: daysInEscrow,
        contingency_days_remaining: 7, // TODO: Calculate from actual contingency dates
        loan_amount: Math.round(loanAmount),
        down_payment: Math.round(downPayment),
        ltv_ratio: Math.round(ltvRatio * 10) / 10,
        total_commission: Math.round(totalCommission),
        my_commission: Math.round(myCommission),
        net_commission: Math.round(netCommission),
        progress_percentage: progressPercentage,
        checklist_completion: 85, // TODO: Calculate from actual checklist data
        document_completion: 70, // TODO: Calculate from actual document data
        estimated_closing_costs: Math.round(estimatedClosingCosts),
        total_cash_needed: Math.round(totalCashNeeded)
      };
    } catch (error) {
      this.logger.error('Error computing stats:', error);
      return {};
    }
  }

  /**
   * Get left sidebar data (quick actions and key contacts)
   * @param {string} escrowId - Escrow ID
   * @param {object} user - Current user
   * @returns {object} Left sidebar data
   */
  async getSidebarLeft(escrowId, user) {
    try {
      // Quick actions (static for now, could be dynamic based on escrow status)
      const quickActions = [
        { id: 1, label: 'Edit Escrow', icon: 'Edit', action: 'edit', color: '#1976d2' },
        { id: 2, label: 'Send Documents', icon: 'Send', action: 'send_docs', color: '#43a047' },
        { id: 3, label: 'Add Note', icon: 'FileText', action: 'add_note', color: '#fb8c00' },
        { id: 4, label: 'Schedule Call', icon: 'Phone', action: 'schedule_call', color: '#8e24aa' },
        { id: 5, label: 'Request Signature', icon: 'Edit3', action: 'request_signature', color: '#e53935' }
      ];

      // Key contacts (placeholder - would query actual contacts table)
      const keyContacts = [
        // TODO: Query actual contacts from database
        // For now, returning empty array
      ];

      // Transaction parties (from escrow fields)
      const escrow = await this.findById(escrowId);
      const transactionParties = {
        buyers: [
          // TODO: Parse from escrow.buyer_name or query contacts
        ],
        sellers: [
          // TODO: Parse from escrow.seller_name or query contacts
        ],
        agents: {
          listing_agent: escrow.listing_agent || 'N/A',
          buyer_agent: `${user.first_name} ${user.last_name}` || 'N/A'
        }
      };

      return {
        quick_actions: quickActions,
        key_contacts: keyContacts,
        transaction_parties: transactionParties
      };
    } catch (error) {
      this.logger.error('Error getting sidebar left:', error);
      return { quick_actions: [], key_contacts: [], transaction_parties: {} };
    }
  }

  /**
   * Get right sidebar data (important dates and AI insights)
   * @param {string} escrowId - Escrow ID
   * @param {object} user - Current user
   * @returns {object} Right sidebar data
   */
  async getSidebarRight(escrowId, user) {
    try {
      const escrow = await this.findById(escrowId);
      const now = new Date();

      // Important dates (placeholder - would query actual dates from database)
      const importantDates = [
        // TODO: Query actual important dates from database
        // For now, using closing date as example
        {
          id: 1,
          date: escrow.closing_date,
          label: 'Closing',
          type: 'closing',
          days_away: Math.ceil((new Date(escrow.closing_date) - now) / (1000 * 60 * 60 * 24)),
          status: 'scheduled',
          critical: true
        }
      ];

      // AI insights (placeholder - would be generated by AI service)
      const aiInsights = [
        {
          type: 'success',
          priority: 'low',
          message: `${importantDates[0].days_away} days until closing - on track`,
          action_required: false
        }
      ];

      // Risk indicators (placeholder - would be calculated from escrow data)
      const riskIndicators = {
        overall_risk: 'low',
        financing_risk: 'low',
        timeline_risk: importantDates[0].days_away < 14 ? 'medium' : 'low',
        inspection_risk: 'low'
      };

      // Smart suggestions (placeholder - would be AI-generated)
      const smartSuggestions = [
        'Schedule final walkthrough 48 hours before closing',
        'Request earnest money receipt from title company'
      ];

      return {
        important_dates: importantDates,
        ai_insights: aiInsights,
        risk_indicators: riskIndicators,
        smart_suggestions: smartSuggestions
      };
    } catch (error) {
      this.logger.error('Error getting sidebar right:', error);
      return { important_dates: [], ai_insights: [], risk_indicators: {}, smart_suggestions: [] };
    }
  }

  /**
   * Get widgets data (timeline, checklists, documents, financials)
   * @param {string} escrowId - Escrow ID
   * @param {object} user - Current user
   * @returns {object} Widgets data
   */
  async getWidgets(escrowId, user) {
    try {
      const [timeline, financials] = await Promise.all([
        this.getTimelineWidget(escrowId),
        this.getFinancialsWidget(escrowId)
      ]);

      return {
        timeline,
        checklists: { items: [], completion_stats: { total_items: 0, completed_items: 0, percentage: 0 } }, // TODO: Implement
        documents: { files: [], stats: { total_files: 0 } }, // TODO: Implement
        financials
      };
    } catch (error) {
      this.logger.error('Error getting widgets:', error);
      return { timeline: {}, checklists: {}, documents: {}, financials: {} };
    }
  }

  /**
   * Get timeline widget data
   * @param {string} escrowId - Escrow ID
   * @returns {object} Timeline data
   */
  async getTimelineWidget(escrowId) {
    try {
      // TODO: Query actual timeline events from database
      // For now, returning placeholder structure
      return {
        events: [],
        total_events: 0,
        unread_count: 0,
        filters: ['all', 'documents', 'status_changes', 'notes', 'communications']
      };
    } catch (error) {
      this.logger.error('Error getting timeline widget:', error);
      return { events: [], total_events: 0, unread_count: 0, filters: [] };
    }
  }

  /**
   * Get financials widget data
   * @param {string} escrowId - Escrow ID
   * @returns {object} Financials data
   */
  async getFinancialsWidget(escrowId) {
    try {
      const escrow = await this.findById(escrowId);
      const purchasePrice = parseFloat(escrow.purchase_price) || 0;
      const downPaymentPercent = parseFloat(escrow.down_payment_percent) || 20;
      const downPayment = purchasePrice * (downPaymentPercent / 100);
      const loanAmount = purchasePrice - downPayment;
      const earnestMoney = parseFloat(escrow.earnest_money_amount) || 0;
      const ltvRatio = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

      // Commission calculations
      const commissionPercent = parseFloat(escrow.commission_percent) || 3;
      const totalCommission = purchasePrice * (commissionPercent / 100);
      const myCommission = totalCommission / 2; // Assuming buyer/seller split
      const brokerageSplit = parseFloat(escrow.brokerage_split) || 80;
      const netCommission = myCommission * (brokerageSplit / 100);

      // Estimated closing costs breakdown
      const lenderFees = purchasePrice * 0.01; // 1%
      const titleEscrow = purchasePrice * 0.005; // 0.5%
      const appraisal = 500;
      const inspection = 450;
      const recordingFees = 150;
      const miscellaneous = 1400;
      const estimatedTotal = lenderFees + titleEscrow + appraisal + inspection + recordingFees + miscellaneous;
      const totalCashNeeded = downPayment + estimatedTotal;

      return {
        transaction_summary: {
          purchase_price: Math.round(purchasePrice),
          down_payment: Math.round(downPayment),
          down_payment_percentage: downPaymentPercent,
          loan_amount: Math.round(loanAmount),
          earnest_money: Math.round(earnestMoney),
          ltv_ratio: Math.round(ltvRatio * 10) / 10
        },
        closing_costs: {
          estimated_total: Math.round(estimatedTotal),
          buyer_costs: Math.round(estimatedTotal * 0.7),
          seller_costs: Math.round(estimatedTotal * 0.3),
          breakdown: [
            { category: 'Lender Fees', amount: Math.round(lenderFees) },
            { category: 'Title & Escrow', amount: Math.round(titleEscrow) },
            { category: 'Appraisal', amount: appraisal },
            { category: 'Inspection', amount: inspection },
            { category: 'Recording Fees', amount: recordingFees },
            { category: 'Miscellaneous', amount: miscellaneous }
          ]
        },
        commission: {
          total_commission: Math.round(totalCommission),
          commission_percentage: commissionPercent,
          my_commission: Math.round(myCommission),
          buyer_agent_commission: Math.round(myCommission),
          net_commission: Math.round(netCommission),
          brokerage_split: brokerageSplit
        },
        cash_needed: {
          total_cash_needed: Math.round(totalCashNeeded),
          breakdown: [
            { item: 'Down Payment', amount: Math.round(downPayment) },
            { item: 'Closing Costs', amount: Math.round(estimatedTotal) }
          ]
        }
      };
    } catch (error) {
      this.logger.error('Error getting financials widget:', error);
      return {};
    }
  }

  /**
   * Get activity feed data
   * @param {string} escrowId - Escrow ID
   * @param {object} user - Current user
   * @returns {object} Activity feed data
   */
  async getActivityFeed(escrowId, user) {
    try {
      // TODO: Query actual activity from database
      // For now, returning placeholder structure
      return {
        recent_activity: [],
        total_activity_count: 0,
        unread_count: 0,
        filters: ['all', 'updates', 'documents', 'communications', 'tasks']
      };
    } catch (error) {
      this.logger.error('Error getting activity feed:', error);
      return { recent_activity: [], total_activity_count: 0, unread_count: 0, filters: [] };
    }
  }

  /**
   * Get metadata (permissions and related entities)
   * @param {string} escrowId - Escrow ID
   * @param {object} user - Current user
   * @returns {object} Metadata
   */
  async getMetadata(escrowId, user) {
    try {
      const escrow = await this.findById(escrowId);

      return {
        permissions: {
          can_edit: true, // TODO: Check actual permissions
          can_delete: true,
          can_archive: true,
          can_view_financials: true,
          can_manage_documents: true,
          can_manage_checklists: true
        },
        related_entities: {
          client_id: escrow.client_id || null,
          listing_id: escrow.listing_id || null,
          appointment_ids: [], // TODO: Query related appointments
          lead_id: null
        },
        sync_status: {
          last_synced: new Date().toISOString(),
          sync_source: 'manual',
          external_ids: {
            mls_id: null,
            title_company_ref: escrow.escrow_number
          }
        }
      };
    } catch (error) {
      this.logger.error('Error getting metadata:', error);
      return { permissions: {}, related_entities: {}, sync_status: {} };
    }
  }
}

module.exports = new EscrowsService();
