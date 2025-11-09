const { pool } = require('../../../config/database');
const logger = require('../../../utils/logger');
const websocketService = require('../../../services/websocket.service');
const NotificationService = require('../../../services/notification.service');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../utils/ownership.helper');

// GET /api/v1/clients
exports.getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

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

    // PHASE 2: Handle ownership-based scope filtering (multi-tenant)
    const userRole = req.user?.role;
    const requestedScope = req.query.scope || getDefaultScope(userRole);
    const scope = validateScope(requestedScope, userRole);

    // Build ownership filter using new helper (clients table alias is 'cl')
    const ownershipFilter = buildOwnershipWhereClauseWithAlias(
      req.user,
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

    // Get clients with contact info
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT
        cl.id,
        cl.client_type,
        cl.status,
        cl.owner_id,
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
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(dataQuery, queryParams);

    res.json({
      success: true,
      data: {
        clients: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch clients',
        details: error.message,
      },
    });
  }
};

// GET /api/v1/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        cl.id,
        cl.client_type,
        cl.status,
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
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch client',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/clients
exports.createClient = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      clientType = 'Buyer',
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      notes,
      tags = [],
    } = req.body;

    await client.query('BEGIN');

    // Check for duplicate email
    if (email) {
      const duplicateCheck = await client.query(
        'SELECT id FROM contacts WHERE email = $1 AND deleted_at IS NULL',
        [email],
      );
      if (duplicateCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'A contact with this email already exists',
          },
        });
      }
    }

    // Create contact first
    const contactQuery = `
      INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone,
        street_address, city, state, zip_code,
        notes, tags, team_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      ) RETURNING id
    `;

    const contactValues = [
      clientType.toLowerCase(), // contact_type: 'buyer', 'seller', 'client'
      firstName,
      lastName,
      email,
      phone,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      notes,
      tags,
      req.user?.teamId || req.user?.team_id || null,
    ];

    const contactResult = await client.query(contactQuery, contactValues);
    const contactId = contactResult.rows[0].id;

    // Create client
    const clientQuery = `
      INSERT INTO clients (contact_id, client_type, status, created_at, updated_at)
      VALUES ($1, $2, 'active', NOW(), NOW())
      RETURNING id
    `;

    const clientResult = await client.query(clientQuery, [contactId, clientType.toLowerCase()]);

    await client.query('COMMIT');

    // Prepare client and user data for notifications and WebSocket
    const newClient = {
      id: clientResult.rows[0].id,
      contact_id: contactId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      client_type: clientType,
      status: 'active',
    };
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const brokerId = req.user?.broker_id || req.user?.brokerId; // Get broker from user

    // Notify broker about new client (fire-and-forget)
    if (brokerId && userId) {
      const agent = {
        id: userId,
        first_name: req.user?.first_name || req.user?.firstName || 'Unknown',
        last_name: req.user?.last_name || req.user?.lastName || 'Agent',
      };
      NotificationService.notifyClientCreated(newClient, agent).catch(err =>
        console.error('Broker notification error:', err)
      );
    }

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const eventData = {
      entityType: 'client',
      entityId: newClient.id,
      action: 'created',
      data: {
        id: newClient.id,
        firstName: newClient.first_name,
        lastName: newClient.last_name,
        email: newClient.email,
        clientType: newClient.client_type
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

    // Return combined data
    res.status(201).json({
      success: true,
      data: newClient,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create client',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};

// PUT /api/v1/clients/:id
exports.updateClient = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get existing client
    const getQuery = `
      SELECT cl.*, co.id as contact_id
      FROM clients cl
      JOIN contacts co ON cl.contact_id = co.id
      WHERE cl.id = $1
    `;

    const existing = await client.query(getQuery, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    await client.query('BEGIN');

    // Update contact if needed
    if (updates.firstName || updates.lastName || updates.email || updates.phone) {
      const contactUpdates = [];
      const contactValues = [];
      let paramIndex = 1;

      if (updates.firstName) {
        contactUpdates.push(`first_name = $${paramIndex++}`);
        contactValues.push(updates.firstName);
      }
      if (updates.lastName) {
        contactUpdates.push(`last_name = $${paramIndex++}`);
        contactValues.push(updates.lastName);
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

        await client.query(contactQuery, contactValues);
      }
    }

    // Update client if needed
    if (updates.clientType || updates.status) {
      const clientUpdates = [];
      const clientValues = [];
      let paramIndex = 1;

      if (updates.clientType) {
        clientUpdates.push(`client_type = $${paramIndex++}`);
        clientValues.push(updates.clientType.toLowerCase());
      }
      if (updates.status) {
        clientUpdates.push(`status = $${paramIndex++}`);
        clientValues.push(updates.status);
      }

      if (clientUpdates.length > 0) {
        clientUpdates.push('updated_at = NOW()');
        clientUpdates.push('version = version + 1');
        clientUpdates.push(`last_modified_by = $${paramIndex++}`);
        clientValues.push(req.user?.id || null);

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

        const result = await client.query(clientQuery, clientValues);

        // Check for version conflict
        if (result.rowCount === 0 && clientVersion !== undefined) {
          await client.query('ROLLBACK');
          const versionCheck = await pool.query('SELECT version FROM clients WHERE id = $1', [id]);
          if (versionCheck.rows.length > 0) {
            return res.status(409).json({
              success: false,
              error: {
                code: 'VERSION_CONFLICT',
                message: 'This client was modified by another user. Please refresh and try again.',
                currentVersion: versionCheck.rows[0].version,
                attemptedVersion: clientVersion,
              },
            });
          }
        }
      }
    }

    await client.query('COMMIT');

    // Get updated data
    const updatedResult = await pool.query(getQuery, [id]);
    const updatedClient = updatedResult.rows[0];

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const brokerId = null; // clients don't have broker_id
    const eventData = {
      entityType: 'client',
      entityId: updatedClient.id,
      action: 'updated',
      data: {
        id: updatedClient.id,
        firstName: updatedClient.first_name,
        lastName: updatedClient.last_name,
        email: updatedClient.email,
        clientType: updatedClient.client_type
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

    res.json({
      success: true,
      data: updatedResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update client',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};

// Archive client - soft delete by setting status to 'archived'
exports.archiveClient = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE clients
      SET status = 'archived', updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: { id: result.rows[0].id },
      message: 'Client archived successfully',
    });
  } catch (error) {
    console.error('Archive client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive client',
      },
    });
  }
};

// DELETE /api/v1/clients/:id
exports.deleteClient = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get contact ID first
    const getQuery = `
      SELECT contact_id FROM clients WHERE id = $1
    `;
    const getResult = await client.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    const contactId = getResult.rows[0].contact_id;

    // Delete client first
    await client.query('DELETE FROM clients WHERE id = $1', [id]);

    // Delete contact
    if (contactId) {
      await client.query('DELETE FROM contacts WHERE id = $1', [contactId]);
    }

    await client.query('COMMIT');

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const brokerId = null; // clients don't have broker_id
    const eventData = {
      entityType: 'client',
      entityId: id,
      action: 'deleted',
      data: {
        id: id
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

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete client',
      },
    });
  } finally {
    client.release();
  }
};

// POST /api/v1/clients/batch-delete
exports.batchDeleteClients = async (req, res) => {
  const client = await pool.connect();
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'IDs must be a non-empty array',
        },
      });
    }

    await client.query('BEGIN');

    // Check which clients exist and are archived
    const checkQuery = `
      SELECT cl.id
      FROM clients cl
      JOIN contacts co ON cl.contact_id = co.id
      WHERE cl.id = ANY($1) AND cl.status = 'archived'
    `;
    const existResult = await client.query(checkQuery, [ids]);

    if (existResult.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'No clients found to delete',
        deletedCount: 0,
        deletedIds: [],
      });
    }

    const existingIds = existResult.rows.map((row) => row.id);

    // Delete clients
    const deleteQuery = `
      DELETE FROM clients
      WHERE id = ANY($1)
      RETURNING id
    `;
    const deleteResult = await client.query(deleteQuery, [existingIds]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.rowCount} clients`,
      deletedCount: deleteResult.rowCount,
      deletedIds: deleteResult.rows.map((row) => row.id),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Batch delete clients error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete clients',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};

// POST /api/v1/clients/:id/notes
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT',
          message: 'Note content is required',
        },
      });
    }

    // Update notes in contacts table
    const query = `
      UPDATE contacts
      SET notes = COALESCE(notes, '') || E'\n' || $1 || ' - ' || NOW()::text,
          updated_at = NOW()
      WHERE id = (SELECT contact_id FROM clients WHERE id = $2)
      RETURNING notes
    `;

    const result = await pool.query(query, [content, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: { notes: result.rows[0].notes },
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTE_ERROR',
        message: 'Failed to add note',
        details: error.message,
      },
    });
  }
};

// PATCH /api/v1/clients/:id/tags
exports.bulkUpdateTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TAGS',
          message: 'Tags must be an array',
        },
      });
    }

    const query = `
      UPDATE contacts
      SET tags = $1, updated_at = NOW()
      WHERE id = (SELECT contact_id FROM clients WHERE id = $2)
      RETURNING tags
    `;

    const result = await pool.query(query, [tags, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: { tags: result.rows[0].tags },
    });
  } catch (error) {
    console.error('Update tags error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to update tags',
        details: error.message,
      },
    });
  }
};
