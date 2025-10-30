const BaseDomainService = require('../../../shared/services/BaseDomainService');
const { pool } = require('../../../config/database');
const { buildOwnershipWhereClauseWithAlias } = require('../../../helpers/ownership.helper');
const websocketService = require('../../../services/websocket.service');
const NotificationService = require('../../../services/notification.service');

/**
 * ClientsService
 * Enhanced clients service extending BaseDomainService
 * Handles client-contact relationship with domain architecture
 */
class ClientsService extends BaseDomainService {
  constructor() {
    super('clients', 'ClientsService');
  }

  /**
   * Override buildQuery to add client-specific filters
   */
  buildQuery(filters) {
    const query = super.buildQuery(filters);

    // Add client-specific filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.clientType) {
      query.client_type = filters.clientType;
    }

    return query;
  }

  /**
   * Override buildWhereClause for client-contact JOIN
   */
  buildWhereClause(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // No deleted_at filter (clients table doesn't have soft delete yet)

    // Process each query parameter
    Object.keys(query).forEach(key => {
      if (key === 'dateRange' && query[key]) {
        if (query[key].start) {
          conditions.push(`cl.created_at >= $${paramIndex++}`);
          values.push(query[key].start);
        }
        if (query[key].end) {
          conditions.push(`cl.created_at <= $${paramIndex++}`);
          values.push(query[key].end);
        }
      } else if (key === 'search' && query[key]) {
        // Search across contact name and email
        conditions.push(`(
          co.first_name ILIKE $${paramIndex}
          OR co.last_name ILIKE $${paramIndex}
          OR co.email ILIKE $${paramIndex}
        )`);
        values.push(`%${query[key]}%`);
        paramIndex++;
      } else if (query[key] !== undefined) {
        conditions.push(`cl.${key} = $${paramIndex++}`);
        values.push(query[key]);
      }
    });

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    return { whereClause, values };
  }

  /**
   * Override findAll to include contact JOIN
   */
  async findAll(filters = {}, options = {}) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const limit = options.limit || 20;
      const offset = options.skip || 0;
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'DESC';

      // Count query with JOIN
      const countQuery = `
        SELECT COUNT(*) as total
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        ${whereClause}
      `;

      // Data query with JOIN and contact fields
      const dataQuery = `
        SELECT
          cl.id,
          cl.contact_id,
          cl.client_type,
          cl.status,
          cl.created_at,
          cl.updated_at,
          cl.team_id,
          cl.broker_id,
          co.first_name,
          co.last_name,
          co.email,
          co.phone,
          co.street_address,
          co.city,
          co.state,
          co.zip_code,
          co.notes,
          co.tags
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        ${whereClause}
        ORDER BY cl.${sortBy} ${sortOrder}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      const [countResult, dataResult] = await Promise.all([
        this.db.query(countQuery, values),
        this.db.query(dataQuery, [...values, limit, offset])
      ]);

      const totalItems = parseInt(countResult.rows[0]?.total || 0);
      const items = dataResult.rows.map(item => this.transform(item));

      const stats = await this.calculateStats(filters);

      return {
        items,
        stats,
        pagination: {
          page: options.page || 1,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Error in findAll for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Override findById to include contact JOIN
   */
  async findById(id) {
    try {
      const query = `
        SELECT
          cl.id,
          cl.contact_id,
          cl.client_type,
          cl.status,
          cl.created_at,
          cl.updated_at,
          cl.team_id,
          cl.broker_id,
          co.first_name,
          co.last_name,
          co.email,
          co.phone,
          co.street_address,
          co.city,
          co.state,
          co.zip_code,
          co.notes,
          co.tags
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.transform(result.rows[0]);
    } catch (error) {
      this.logger.error(`Error finding client by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced statistics calculation for clients
   */
  async calculateStats(filters) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN cl.status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN cl.status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN cl.client_type = 'Buyer' THEN 1 END) as buyers,
          COUNT(CASE WHEN cl.client_type = 'Seller' THEN 1 END) as sellers,
          COUNT(CASE WHEN cl.client_type = 'Both' THEN 1 END) as both
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        ${whereClause}
      `;

      const result = await this.db.query(statsQuery, values);
      const stats = result.rows[0];

      return {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        inactive: parseInt(stats.inactive) || 0,
        buyers: parseInt(stats.buyers) || 0,
        sellers: parseInt(stats.sellers) || 0,
        both: parseInt(stats.both) || 0,
        activePercentage: stats.total > 0
          ? Math.round((stats.active / stats.total) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error('Error calculating client stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        buyers: 0,
        sellers: 0,
        both: 0,
        activePercentage: 0
      };
    }
  }

  /**
   * Create new client with contact
   */
  async create(data, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate required fields
      if (!data.firstName && !data.first_name) {
        throw new Error('first_name is required');
      }

      if (!data.lastName && !data.last_name) {
        throw new Error('last_name is required');
      }

      const firstName = data.firstName || data.first_name;
      const lastName = data.lastName || data.last_name;
      const email = data.email;
      const phone = data.phone;

      // Check for duplicate email
      if (email) {
        const duplicateCheck = await client.query(
          'SELECT id FROM contacts WHERE email = $1',
          [email]
        );

        if (duplicateCheck.rows.length > 0) {
          throw new Error(`Contact with email ${email} already exists`);
        }
      }

      // Create contact first
      const contactFields = ['first_name', 'last_name'];
      const contactValues = [firstName, lastName];
      const contactPlaceholders = ['$1', '$2'];
      let contactParamIndex = 3;

      const optionalContactFields = {
        email: email,
        phone: phone,
        street_address: data.addressStreet || data.street_address,
        city: data.addressCity || data.city,
        state: data.addressState || data.state,
        zip_code: data.addressZip || data.zip_code,
        notes: data.notes,
        tags: data.tags
      };

      for (const [field, value] of Object.entries(optionalContactFields)) {
        if (value !== undefined && value !== null) {
          contactFields.push(field);
          contactValues.push(value);
          contactPlaceholders.push(`$${contactParamIndex++}`);
        }
      }

      const contactInsertQuery = `
        INSERT INTO contacts (${contactFields.join(', ')})
        VALUES (${contactPlaceholders.join(', ')})
        RETURNING id
      `;

      const contactResult = await client.query(contactInsertQuery, contactValues);
      const contactId = contactResult.rows[0].id;

      // Create client
      const clientInsertQuery = `
        INSERT INTO clients (
          contact_id,
          client_type,
          status,
          team_id,
          broker_id,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const clientResult = await client.query(clientInsertQuery, [
        contactId,
        data.clientType || data.client_type || 'Buyer',
        data.status || 'active',
        user.team_id,
        user.broker_id,
        user.id
      ]);

      const newClient = clientResult.rows[0];

      await client.query('COMMIT');

      // Fetch full client with contact data
      const fullClient = await this.findById(newClient.id);

      // Emit WebSocket event
      const eventData = {
        entityType: 'client',
        entityId: newClient.id,
        action: 'created',
        data: fullClient
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
          type: 'client_created',
          message: `New client created: ${firstName} ${lastName}`,
          entityType: 'client',
          entityId: newClient.id
        });
      }

      return fullClient;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error creating client:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update client and/or contact
   */
  async update(id, data, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get existing client to find contact_id
      const existing = await this.findById(id);

      if (!existing) {
        throw new Error('Client not found');
      }

      // Update contact if contact fields provided
      const contactUpdateFields = [];
      const contactValues = [];
      let contactParamIndex = 1;

      const contactFieldMap = {
        first_name: data.firstName || data.first_name,
        last_name: data.lastName || data.last_name,
        email: data.email,
        phone: data.phone,
        street_address: data.addressStreet || data.street_address,
        city: data.addressCity || data.city,
        state: data.addressState || data.state,
        zip_code: data.addressZip || data.zip_code,
        notes: data.notes,
        tags: data.tags
      };

      for (const [field, value] of Object.entries(contactFieldMap)) {
        if (value !== undefined && value !== null) {
          contactUpdateFields.push(`${field} = $${contactParamIndex++}`);
          contactValues.push(value);
        }
      }

      if (contactUpdateFields.length > 0) {
        contactValues.push(existing.contact_id);

        const contactUpdateQuery = `
          UPDATE contacts
          SET ${contactUpdateFields.join(', ')}, updated_at = NOW()
          WHERE id = $${contactParamIndex}
        `;

        await client.query(contactUpdateQuery, contactValues);
      }

      // Update client if client fields provided
      const clientUpdateFields = [];
      const clientValues = [];
      let clientParamIndex = 1;

      const clientFieldMap = {
        client_type: data.clientType || data.client_type,
        status: data.status
      };

      for (const [field, value] of Object.entries(clientFieldMap)) {
        if (value !== undefined && value !== null) {
          clientUpdateFields.push(`${field} = $${clientParamIndex++}`);
          clientValues.push(value);
        }
      }

      if (clientUpdateFields.length > 0) {
        clientUpdateFields.push(`updated_at = NOW()`);
        clientValues.push(id);

        const clientUpdateQuery = `
          UPDATE clients
          SET ${clientUpdateFields.join(', ')}
          WHERE id = $${clientParamIndex}
        `;

        await client.query(clientUpdateQuery, clientValues);
      }

      await client.query('COMMIT');

      // Fetch updated client with contact data
      const updated = await this.findById(id);

      // Emit WebSocket event
      const eventData = {
        entityType: 'client',
        entityId: id,
        action: 'updated',
        data: updated
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

      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error updating client:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete client (hard delete - no soft delete in clients table yet)
   */
  async delete(id, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get contact_id before deleting client
      const existing = await this.findById(id);

      if (!existing) {
        throw new Error('Client not found');
      }

      // Delete client first (cascades won't delete contact)
      await client.query('DELETE FROM clients WHERE id = $1', [id]);

      // Optionally delete orphaned contact (if not used elsewhere)
      await client.query('DELETE FROM contacts WHERE id = $1', [existing.contact_id]);

      await client.query('COMMIT');

      // Emit WebSocket event
      const eventData = {
        entityType: 'client',
        entityId: id,
        action: 'deleted',
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
      await client.query('ROLLBACK');
      this.logger.error('Error deleting client:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Transform client data (flatten contact fields)
   */
  transform(client) {
    if (!client) return null;

    return {
      id: client.id,
      contactId: client.contact_id,
      clientType: client.client_type,
      status: client.status,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.phone,
      streetAddress: client.street_address,
      city: client.city,
      state: client.state,
      zipCode: client.zip_code,
      notes: client.notes,
      tags: client.tags,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      teamId: client.team_id,
      brokerId: client.broker_id
    };
  }
}

module.exports = new ClientsService();
