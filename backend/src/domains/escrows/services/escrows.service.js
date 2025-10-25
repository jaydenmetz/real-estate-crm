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

    // Soft delete filter
    conditions.push('deleted_at IS NULL');

    // Process each query parameter
    Object.keys(query).forEach(key => {
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
}

module.exports = new EscrowsService();
