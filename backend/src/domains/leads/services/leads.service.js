const BaseDomainService = require('../../../shared/services/BaseDomainService');
const { pool } = require('../../../config/database');
const websocketService = require('../../../services/websocket.service');
const NotificationService = require('../../../services/notification.service');

/**
 * LeadsService
 * Enhanced leads service extending BaseDomainService
 * Handles lead management with privacy support and domain architecture
 */
class LeadsService extends BaseDomainService {
  constructor() {
    super('leads', 'LeadsService');
  }

  /**
   * Override buildQuery to add lead-specific filters
   */
  buildQuery(filters) {
    const query = super.buildQuery(filters);

    // Add lead-specific filters
    if (filters.leadStatus) {
      query.lead_status = filters.leadStatus;
    }

    if (filters.leadSource) {
      query.lead_source = filters.leadSource;
    }

    if (filters.isPrivate !== undefined) {
      query.is_private = filters.isPrivate;
    }

    return query;
  }

  /**
   * Override buildWhereClause to handle lead-specific fields
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
      } else if (key === 'search' && query[key]) {
        // Search across name, email, and phone
        conditions.push(`(
          first_name ILIKE $${paramIndex}
          OR last_name ILIKE $${paramIndex}
          OR email ILIKE $${paramIndex}
          OR phone ILIKE $${paramIndex}
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
   * Enhanced statistics calculation for leads
   */
  async calculateStats(filters) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN lead_status = 'New' THEN 1 END) as new,
          COUNT(CASE WHEN lead_status = 'Contacted' THEN 1 END) as contacted,
          COUNT(CASE WHEN lead_status = 'Qualified' THEN 1 END) as qualified,
          COUNT(CASE WHEN lead_status = 'Converted' THEN 1 END) as converted,
          COUNT(CASE WHEN lead_status = 'Lost' THEN 1 END) as lost,
          COUNT(CASE WHEN is_private = true THEN 1 END) as private_leads,
          COUNT(CASE WHEN is_private = false OR is_private IS NULL THEN 1 END) as public_leads,
          COUNT(CASE WHEN lead_source = 'Website' THEN 1 END) as website,
          COUNT(CASE WHEN lead_source = 'Referral' THEN 1 END) as referral,
          COUNT(CASE WHEN lead_source = 'Social Media' THEN 1 END) as social_media,
          COUNT(CASE WHEN lead_source = 'Cold Call' THEN 1 END) as cold_call,
          COUNT(CASE WHEN lead_source = 'Open House' THEN 1 END) as open_house
        FROM ${this.tableName}
        ${whereClause}
      `;

      const result = await this.db.query(statsQuery, values);
      const stats = result.rows[0];

      return {
        total: parseInt(stats.total) || 0,
        new: parseInt(stats.new) || 0,
        contacted: parseInt(stats.contacted) || 0,
        qualified: parseInt(stats.qualified) || 0,
        converted: parseInt(stats.converted) || 0,
        lost: parseInt(stats.lost) || 0,
        privateLeads: parseInt(stats.private_leads) || 0,
        publicLeads: parseInt(stats.public_leads) || 0,
        website: parseInt(stats.website) || 0,
        referral: parseInt(stats.referral) || 0,
        socialMedia: parseInt(stats.social_media) || 0,
        coldCall: parseInt(stats.cold_call) || 0,
        openHouse: parseInt(stats.open_house) || 0,
        conversionRate: (stats.total > 0 && stats.converted > 0)
          ? Math.round((stats.converted / stats.total) * 100)
          : 0,
        qualificationRate: (stats.total > 0 && stats.qualified > 0)
          ? Math.round((stats.qualified / stats.total) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error('Error calculating lead stats:', error);
      return {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0,
        privateLeads: 0,
        publicLeads: 0,
        website: 0,
        referral: 0,
        socialMedia: 0,
        coldCall: 0,
        openHouse: 0,
        conversionRate: 0,
        qualificationRate: 0
      };
    }
  }

  /**
   * Create new lead
   */
  async create(data, user) {
    try {
      // Validate required fields
      if (!data.firstName && !data.first_name) {
        throw new Error('first_name is required');
      }

      if (!data.lastName && !data.last_name) {
        throw new Error('last_name is required');
      }

      // Build dynamic insert query
      const fields = ['first_name', 'last_name', 'lead_status'];
      const values = [
        data.firstName || data.first_name,
        data.lastName || data.last_name,
        data.leadStatus || data.lead_status || 'New'
      ];
      const placeholders = ['$1', '$2', '$3'];
      let paramIndex = 4;

      // Add optional fields
      const optionalFields = {
        email: data.email,
        phone: data.phone,
        lead_source: data.leadSource || data.lead_source,
        notes: data.notes,
        is_private: data.isPrivate !== undefined ? data.isPrivate : data.is_private,
        agent_id: user.id,
        team_id: user.team_id,
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
        INSERT INTO leads (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders.join(', ')}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await this.db.query(insertQuery, values);
      const newLead = result.rows[0];

      // Emit WebSocket event (respecting privacy - don't send to broker if private)
      const eventData = {
        entityType: 'lead',
        entityId: newLead.id,
        action: 'created',
        data: this.transform(newLead)
      };

      // Only send to broker if lead is NOT private
      if (user.broker_id && !newLead.is_private) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }

      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      // Send broker notification only if not private
      if (user.broker_id && !newLead.is_private) {
        await NotificationService.createNotification({
          userId: user.broker_id,
          type: 'lead_created',
          message: `New lead created: ${newLead.first_name} ${newLead.last_name}`,
          entityType: 'lead',
          entityId: newLead.id
        });
      }

      return this.transform(newLead);
    } catch (error) {
      this.logger.error('Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Update lead
   */
  async update(id, data, user) {
    try {
      // Get existing lead to check privacy status
      const existing = await this.findById(id);

      if (!existing) {
        throw new Error('Lead not found');
      }

      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = {
        first_name: data.firstName || data.first_name,
        last_name: data.lastName || data.last_name,
        email: data.email,
        phone: data.phone,
        lead_status: data.leadStatus || data.lead_status,
        lead_source: data.leadSource || data.lead_source,
        notes: data.notes,
        is_private: data.isPrivate !== undefined ? data.isPrivate : data.is_private
      };

      for (const [field, value] of Object.entries(allowedFields)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${field} = $${paramIndex++}`);
          values.push(value);
        }
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Add ID as last parameter
      values.push(id);

      const updateQuery = `
        UPDATE leads
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Lead not found or has been deleted');
      }

      const updated = this.transform(result.rows[0]);

      // Emit WebSocket event (respecting privacy)
      const eventData = {
        entityType: 'lead',
        entityId: id,
        action: 'updated',
        data: updated
      };

      // Only send to broker if lead is NOT private
      if (user.broker_id && !updated.isPrivate) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }

      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      return updated;
    } catch (error) {
      this.logger.error('Error updating lead:', error);
      throw error;
    }
  }

  /**
   * Archive lead (soft delete)
   */
  async archive(id, user) {
    try {
      const query = `
        UPDATE leads
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Lead not found or already archived');
      }

      // Emit WebSocket event
      const eventData = {
        entityType: 'lead',
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
      this.logger.error('Error archiving lead:', error);
      throw error;
    }
  }

  /**
   * Restore archived lead
   */
  async restore(id, user) {
    try {
      const query = `
        UPDATE leads
        SET deleted_at = NULL
        WHERE id = $1
        AND deleted_at IS NOT NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Lead not found or not archived');
      }

      const restored = this.transform(result.rows[0]);

      // Emit WebSocket event (respecting privacy)
      const eventData = {
        entityType: 'lead',
        entityId: id,
        action: 'restored',
        data: restored
      };

      if (user.broker_id && !restored.isPrivate) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return restored;
    } catch (error) {
      this.logger.error('Error restoring lead:', error);
      throw error;
    }
  }

  /**
   * Transform lead data (camelCase conversion)
   */
  transform(lead) {
    if (!lead) return null;

    return {
      id: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      leadStatus: lead.lead_status,
      leadSource: lead.lead_source,
      notes: lead.notes,
      isPrivate: lead.is_private,
      agentId: lead.agent_id,
      teamId: lead.team_id,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      deletedAt: lead.deleted_at,
      createdBy: lead.created_by
    };
  }
}

module.exports = new LeadsService();
