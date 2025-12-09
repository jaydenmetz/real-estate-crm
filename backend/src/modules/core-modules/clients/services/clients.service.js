/**
 * Clients Service
 *
 * Business logic layer for clients module.
 * Handles all client-related operations including:
 * - CRUD operations across clients and contacts tables
 * - Query building with filters, pagination, and sorting
 * - Ownership-based access control
 * - WebSocket event emissions
 * - Transaction management for multi-table operations
 * - Notification triggers
 *
 * @module modules/clients/services/clients
 */

const { pool } = require('../../../../config/infrastructure/database');
const logger = require('../../../../utils/logger');
const websocketService = require('../../../../lib/infrastructure/websocket.service');
const NotificationService = require('../../../../lib/communication/notification.service');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../../utils/ownership.helper');

class ClientsService {
  /**
   * Get all clients with filtering, pagination, sorting, and ownership controls
   * @param {Object} filters - Filter parameters
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Clients list with pagination metadata
   */
  async getAllClients(filters, user) {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      scope: requestedScope,
    } = filters;

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereConditions.push(`cl.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(co.first_name ILIKE $${paramIndex} OR co.last_name ILIKE $${paramIndex} OR co.email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Handle ownership-based scope filtering (multi-tenant)
    const userRole = Array.isArray(user?.role) ? user.role[0] : user?.role;

    try {
      const scope = validateScope(requestedScope || getDefaultScope(userRole), userRole);

      // Build ownership filter (clients table alias is 'cl')
      const ownershipFilter = buildOwnershipWhereClauseWithAlias(
        user,
        scope,
        'client',
        'cl',
        paramIndex
      );

      if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
        whereConditions.push(ownershipFilter.whereClause);
        queryParams.push(...ownershipFilter.params);
        paramIndex = ownershipFilter.nextParamIndex;
      }
    } catch (scopeError) {
      // If scope validation fails, default to user's own data
      console.warn('Scope validation failed, defaulting to user ownership:', scopeError.message);
      whereConditions.push(`cl.owner_id = $${paramIndex}`);
      queryParams.push(user.id);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM clients cl
      JOIN contacts co ON cl.contact_id = co.id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Validate and build ORDER BY clause
    const allowedSortFields = {
      'created_at': 'cl.created_at',
      'updated_at': 'cl.updated_at',
      'first_name': 'co.first_name',
      'last_name': 'co.last_name',
      'email': 'co.email',
      'status': 'cl.status',
      'client_type': 'cl.client_type',
    };

    const sortField = allowedSortFields[sortBy] || 'cl.created_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const orderByClause = `ORDER BY ${sortField} ${sortDirection}`;

    // Get clients with contact info and lifetime value
    // Lifetime value = sum of net_commission from all escrows where this contact is buyer or seller
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT
        cl.id,
        cl.client_type,
        cl.status,
        cl.owner_id,
        cl.budget,
        cl.commission,
        cl.commission_percentage,
        cl.commission_type,
        cl.agreement_start_date,
        cl.agreement_end_date,
        cl.lead_ids,
        cl.display_name,
        cl.entity_type,
        cl.entity_name,
        cl.representative_title,
        cl.representative_contact_id,
        cl.created_at,
        cl.updated_at,
        co.first_name,
        co.last_name,
        co.email,
        co.phone,
        co.street_address,
        co.city,
        co.state,
        co.zip_code,
        co.notes,
        co.tags,
        COALESCE(ltv.lifetime_value, 0) as lifetime_value,
        COALESCE(ltv.closed_value, 0) as closed_value,
        COALESCE(ltv.pending_value, 0) as pending_value,
        COALESCE(ltv.escrow_count, 0) as escrow_count,
        COALESCE(leads_data.leads, '[]'::jsonb) as leads
      FROM clients cl
      JOIN contacts co ON cl.contact_id = co.id
      LEFT JOIN LATERAL (
        SELECT
          SUM(COALESCE(e.net_commission, 0)) as lifetime_value,
          SUM(CASE WHEN LOWER(e.escrow_status) = 'closed' THEN COALESCE(e.net_commission, 0) ELSE 0 END) as closed_value,
          SUM(CASE WHEN LOWER(e.escrow_status) = 'active' THEN COALESCE(e.net_commission, 0) ELSE 0 END) as pending_value,
          COUNT(e.id) as escrow_count
        FROM escrows e
        WHERE e.people->>'buyer' = co.id::text
           OR e.people->>'seller' = co.id::text
           OR e.people->>'buyerAgent' = co.id::text
           OR e.people->>'sellerAgent' = co.id::text
           OR e.people->>'referral' = co.id::text
      ) ltv ON true
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', l.id,
            'firstName', l.first_name,
            'lastName', l.last_name,
            'email', l.email,
            'phone', l.phone
          )
        ) as leads
        FROM leads l
        WHERE l.id = ANY(cl.lead_ids)
      ) leads_data ON true
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(dataQuery, queryParams);

    return {
      clients: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        limit: parseInt(limit),
      },
    };
  }

  /**
   * Get single client by ID with contact info
   * @param {string} id - Client ID
   * @returns {Promise<Object|null>} Client data with contact or null if not found
   */
  async getClientById(id) {
    const query = `
      SELECT
        cl.id,
        cl.client_type,
        cl.status,
        cl.budget,
        cl.commission,
        cl.commission_percentage,
        cl.commission_type,
        cl.agreement_start_date,
        cl.agreement_end_date,
        cl.display_name,
        cl.entity_type,
        cl.entity_name,
        cl.representative_title,
        cl.representative_contact_id,
        cl.created_at,
        cl.updated_at,
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

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create new client (with contact record in transaction)
   * @param {Object} clientData - Client and contact data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created client
   */
  async createClient(clientData, user) {
    const dbClient = await pool.connect();

    try {
      // Accept both camelCase and snake_case field names
      const {
        firstName, lastName, email, phone, clientType,
        addressStreet, addressCity, addressState, addressZip,
        notes, tags = [], budget,
        commission, commission_percentage, commission_type,
        agreement_start_date, agreement_end_date,
        // Entity type fields
        entity_type, entityType,
        entity_name, entityName,
        representative_title, representativeTitle,
        representative_contact_id, representativeContactId,
        // snake_case alternatives
        first_name, last_name, client_type,
        address_street, address_city, address_state, address_zip,
      } = clientData;

      // Use snake_case if camelCase not provided
      const finalFirstName = firstName || first_name;
      const finalLastName = lastName || last_name;
      const finalClientType = (clientType || client_type || 'Buyer');
      const finalAddressStreet = addressStreet || address_street;
      const finalAddressCity = addressCity || address_city;
      const finalAddressState = addressState || address_state;
      const finalAddressZip = addressZip || address_zip;
      const finalEntityType = entity_type || entityType || 'individual';
      const finalEntityName = entity_name || entityName || null;
      const finalRepresentativeTitle = representative_title || representativeTitle || null;
      const finalRepresentativeContactId = representative_contact_id || representativeContactId || null;

      await dbClient.query('BEGIN');

      // Check for duplicate email
      if (email) {
        const duplicateCheck = await dbClient.query(
          'SELECT id FROM contacts WHERE email = $1 AND deleted_at IS NULL',
          [email],
        );
        if (duplicateCheck.rows.length > 0) {
          await dbClient.query('ROLLBACK');
          throw new Error('DUPLICATE_EMAIL');
        }
      }

      // Create contact first
      // user_id is required (NOT NULL) in contacts table
      const contactQuery = `
        INSERT INTO contacts (
          contact_type, first_name, last_name, email, phone,
          street_address, city, state, zip_code,
          notes, tags, team_id, user_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        ) RETURNING id
      `;

      const contactValues = [
        finalClientType.toLowerCase(), // contact_type: 'buyer', 'seller', 'client'
        finalFirstName,
        finalLastName,
        email,
        phone,
        finalAddressStreet,
        finalAddressCity,
        finalAddressState,
        finalAddressZip,
        notes,
        tags,
        user?.teamId || user?.team_id || null,
        user?.id || null, // user_id - required field
      ];

      const contactResult = await dbClient.query(contactQuery, contactValues);
      const contactId = contactResult.rows[0].id;

      // Create client with owner_id and team_id for proper ownership filtering
      // Also handle lead_ids for lead-to-client conversion
      const leadIds = clientData.lead_ids || clientData.leadIds || [];
      // Format lead_ids for PostgreSQL uuid[] - use null for empty array
      const formattedLeadIds = leadIds.length > 0 ? leadIds : null;

      const clientQuery = `
        INSERT INTO clients (
          contact_id, client_type, status, budget,
          commission, commission_percentage, commission_type,
          agreement_start_date, agreement_end_date,
          lead_ids, owner_id, team_id,
          entity_type, entity_name, representative_title, representative_contact_id,
          created_at, updated_at
        )
        VALUES ($1, $2, 'active', $3, $4, $5, $6, $7, $8, COALESCE($9, '{}'::uuid[]), $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING id
      `;

      const clientResult = await dbClient.query(clientQuery, [
        contactId,
        finalClientType.toLowerCase(),
        budget || null,
        commission || null,
        commission_percentage || null,
        commission_type || 'percentage',
        agreement_start_date || null,
        agreement_end_date || null,
        formattedLeadIds,
        user?.id || null,
        user?.teamId || user?.team_id || null,
        finalEntityType,
        finalEntityName,
        finalRepresentativeTitle,
        finalRepresentativeContactId
      ]);

      await dbClient.query('COMMIT');

      // Prepare client data for notifications and WebSocket
      const newClient = {
        id: clientResult.rows[0].id,
        contact_id: contactId,
        first_name: finalFirstName,
        last_name: finalLastName,
        email,
        phone,
        client_type: finalClientType,
        status: 'active',
      };

      // Notify broker about new client (fire-and-forget)
      const brokerId = user?.broker_id || user?.brokerId;
      const userId = user?.id;

      if (brokerId && userId) {
        const agent = {
          id: userId,
          first_name: user?.first_name || user?.firstName || 'Unknown',
          last_name: user?.last_name || user?.lastName || 'Agent',
        };
        NotificationService.notifyClientCreated(newClient, agent).catch(err =>
          console.error('Broker notification error:', err)
        );
      }

      // Emit WebSocket event for real-time updates
      this._emitWebSocketEvent(user, 'created', newClient);

      return newClient;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /**
   * Update existing client (may update both clients and contacts tables)
   * @param {string} id - Client ID
   * @param {Object} updates - Fields to update
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object|null>} Updated client or null if not found
   */
  async updateClient(id, updates, user) {
    const dbClient = await pool.connect();

    try {
      // Get existing client
      const getQuery = `
        SELECT cl.*, co.id as contact_id
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1
      `;

      const existing = await dbClient.query(getQuery, [id]);
      if (existing.rows.length === 0) {
        return null;
      }

      await dbClient.query('BEGIN');

      // Update contact if needed (accept both camelCase and snake_case)
      const firstName = updates.firstName || updates.first_name;
      const lastName = updates.lastName || updates.last_name;
      if (firstName || lastName || updates.email || updates.phone) {
        const contactUpdates = [];
        const contactValues = [];
        let paramIndex = 1;

        if (firstName) {
          contactUpdates.push(`first_name = $${paramIndex++}`);
          contactValues.push(firstName);
        }
        if (lastName) {
          contactUpdates.push(`last_name = $${paramIndex++}`);
          contactValues.push(lastName);
        }
        if (updates.email) {
          contactUpdates.push(`email = $${paramIndex++}`);
          contactValues.push(updates.email);
        }
        if (updates.phone) {
          contactUpdates.push(`phone = $${paramIndex++}`);
          contactValues.push(updates.phone);
        }

        if (contactUpdates.length > 0) {
          contactUpdates.push('updated_at = NOW()');
          contactValues.push(existing.rows[0].contact_id);

          const contactQuery = `
            UPDATE contacts
            SET ${contactUpdates.join(', ')}
            WHERE id = $${paramIndex}
          `;

          await dbClient.query(contactQuery, contactValues);
        }
      }

      // Update client if needed (accept both camelCase and snake_case)
      const clientType = updates.clientType || updates.client_type;
      const clientStatus = updates.status || updates.client_status || updates.stage;
      const leadIds = updates.lead_ids || updates.leadIds;
      const displayName = updates.display_name || updates.displayName;
      const entityType = updates.entity_type || updates.entityType;
      const entityName = updates.entity_name || updates.entityName;
      const representativeTitle = updates.representative_title || updates.representativeTitle;
      const representativeContactId = updates.representative_contact_id || updates.representativeContactId;
      const hasClientUpdates = clientType || clientStatus ||
        updates.budget !== undefined ||
        updates.commission !== undefined ||
        updates.commission_percentage !== undefined ||
        updates.commission_type !== undefined ||
        updates.agreement_start_date !== undefined ||
        updates.agreement_end_date !== undefined ||
        leadIds !== undefined ||
        displayName !== undefined ||
        entityType !== undefined ||
        entityName !== undefined ||
        representativeTitle !== undefined ||
        representativeContactId !== undefined;

      if (hasClientUpdates) {
        const clientUpdates = [];
        const clientValues = [];
        let paramIndex = 1;

        if (clientType) {
          clientUpdates.push(`client_type = $${paramIndex++}`);
          clientValues.push(clientType.toLowerCase());
        }
        if (clientStatus) {
          clientUpdates.push(`status = $${paramIndex++}`);
          clientValues.push(clientStatus);
        }
        if (updates.budget !== undefined) {
          clientUpdates.push(`budget = $${paramIndex++}`);
          clientValues.push(updates.budget);
        }
        if (updates.commission !== undefined) {
          clientUpdates.push(`commission = $${paramIndex++}`);
          clientValues.push(updates.commission);
        }
        if (updates.commission_percentage !== undefined) {
          clientUpdates.push(`commission_percentage = $${paramIndex++}`);
          clientValues.push(updates.commission_percentage);
        }
        if (updates.commission_type !== undefined) {
          clientUpdates.push(`commission_type = $${paramIndex++}`);
          clientValues.push(updates.commission_type);
        }
        if (updates.agreement_start_date !== undefined) {
          clientUpdates.push(`agreement_start_date = $${paramIndex++}`);
          clientValues.push(updates.agreement_start_date);
        }
        if (updates.agreement_end_date !== undefined) {
          clientUpdates.push(`agreement_end_date = $${paramIndex++}`);
          clientValues.push(updates.agreement_end_date);
        }
        if (leadIds !== undefined) {
          clientUpdates.push(`lead_ids = $${paramIndex++}`);
          clientValues.push(leadIds);
        }
        if (displayName !== undefined) {
          clientUpdates.push(`display_name = $${paramIndex++}`);
          clientValues.push(displayName);
        }
        if (entityType !== undefined) {
          clientUpdates.push(`entity_type = $${paramIndex++}`);
          clientValues.push(entityType);
        }
        if (entityName !== undefined) {
          clientUpdates.push(`entity_name = $${paramIndex++}`);
          clientValues.push(entityName);
        }
        if (representativeTitle !== undefined) {
          clientUpdates.push(`representative_title = $${paramIndex++}`);
          clientValues.push(representativeTitle);
        }
        if (representativeContactId !== undefined) {
          clientUpdates.push(`representative_contact_id = $${paramIndex++}`);
          clientValues.push(representativeContactId);
        }

        if (clientUpdates.length > 0) {
          clientUpdates.push('updated_at = NOW()');
          clientUpdates.push('version = version + 1');
          clientUpdates.push(`last_modified_by = $${paramIndex++}`);
          clientValues.push(user?.id || null);

          // Optimistic locking: check version if provided
          const { version: clientVersion } = updates;
          let versionClause = '';
          if (clientVersion !== undefined) {
            versionClause = ` AND version = $${paramIndex++}`;
            clientValues.push(clientVersion);
          }

          clientValues.push(id);

          const clientQuery = `
            UPDATE clients
            SET ${clientUpdates.join(', ')}
            WHERE id = $${paramIndex}${versionClause}
          `;

          const result = await dbClient.query(clientQuery, clientValues);

          // Check for version conflict
          if (result.rowCount === 0 && clientVersion !== undefined) {
            await dbClient.query('ROLLBACK');
            throw new Error('VERSION_CONFLICT');
          }
        }
      }

      await dbClient.query('COMMIT');

      // Get updated data
      const updatedResult = await pool.query(getQuery, [id]);
      const updatedClient = updatedResult.rows[0];

      // Emit WebSocket event for real-time updates
      this._emitWebSocketEvent(user, 'updated', updatedClient);

      return updatedClient;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /**
   * Archive client (soft delete by setting status to 'archived')
   * @param {string} id - Client ID
   * @returns {Promise<Object|null>} Archived client or null if not found
   */
  async archiveClient(id) {
    const query = `
      UPDATE clients
      SET status = 'archived', updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return { id: result.rows[0].id };
  }

  /**
   * Permanently delete client (and associated contact)
   * @param {string} id - Client ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteClient(id, user) {
    const dbClient = await pool.connect();

    try {
      await dbClient.query('BEGIN');

      // Get contact ID first
      const getQuery = `SELECT contact_id FROM clients WHERE id = $1`;
      const getResult = await dbClient.query(getQuery, [id]);

      if (getResult.rows.length === 0) {
        await dbClient.query('ROLLBACK');
        return null;
      }

      const contactId = getResult.rows[0].contact_id;

      // Delete client first
      await dbClient.query('DELETE FROM clients WHERE id = $1', [id]);

      // Delete contact
      if (contactId) {
        await dbClient.query('DELETE FROM contacts WHERE id = $1', [contactId]);
      }

      await dbClient.query('COMMIT');

      // Emit WebSocket event for real-time updates
      this._emitWebSocketEvent(user, 'deleted', { id });

      return true;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /**
   * Batch delete multiple clients (must be archived)
   * @param {Array<string>} ids - Client IDs
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Deletion results
   */
  async batchDeleteClients(ids, user) {
    const dbClient = await pool.connect();

    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('IDs must be a non-empty array');
      }

      await dbClient.query('BEGIN');

      // Check which clients exist and are archived
      const checkQuery = `
        SELECT cl.id
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = ANY($1) AND cl.status = 'archived'
      `;
      const existResult = await dbClient.query(checkQuery, [ids]);

      if (existResult.rows.length === 0) {
        await dbClient.query('COMMIT');
        return {
          deletedCount: 0,
          deletedIds: [],
          message: 'No clients found to delete',
        };
      }

      const existingIds = existResult.rows.map((row) => row.id);

      // Delete clients
      const deleteQuery = `
        DELETE FROM clients
        WHERE id = ANY($1)
        RETURNING id
      `;
      const deleteResult = await dbClient.query(deleteQuery, [existingIds]);

      await dbClient.query('COMMIT');

      return {
        deletedCount: deleteResult.rowCount,
        deletedIds: deleteResult.rows.map((row) => row.id),
        message: `Successfully deleted ${deleteResult.rowCount} clients`,
      };
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /**
   * Emit WebSocket event for client changes
   * @private
   * @param {Object} user - Authenticated user
   * @param {string} action - Action type (created, updated, deleted)
   * @param {Object} client - Client data
   */
  _emitWebSocketEvent(user, action, client) {
    const teamId = user?.teamId || user?.team_id;
    const userId = user?.id;
    const brokerId = user?.broker_id || user?.brokerId;

    const eventData = {
      entityType: 'client',
      entityId: client.id,
      action,
      data: action === 'deleted'
        ? { id: client.id }
        : {
          id: client.id,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email,
          clientType: client.client_type
        }
    };

    // Send to broker room (all users under this broker)
    if (brokerId) {
      websocketService.sendToBroker(brokerId, 'data:update', eventData);
    }

    // Send to team room if user has a team
    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', eventData);
    }

    // Always send to user's personal room as fallback
    if (userId) {
      websocketService.sendToUser(userId, 'data:update', eventData);
    }
  }
}

module.exports = new ClientsService();
