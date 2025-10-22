const { pool } = require('../config/database');
const logger = require('../utils/logger');
const websocketService = require('../services/websocket.service');
const { buildOwnershipWhereClause, validateScope, getDefaultScope } = require('../helpers/ownership.helper');

// GET /api/v1/leads
exports.getLeads = async (req, res) => {
  try {
    const {
      leadStatus,
      leadType,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = ['deleted_at IS NULL'];
    const queryParams = [];
    let paramIndex = 1;

    // Status filter
    if (leadStatus) {
      whereConditions.push(`lead_status = $${paramIndex}`);
      queryParams.push(leadStatus);
      paramIndex++;
    }

    // Type filter - column doesn't exist yet, skipping
    // TODO: Add lead_type column to leads table
    // if (leadType) {
    //   whereConditions.push(`lead_type = $${paramIndex}`);
    //   queryParams.push(leadType);
    //   paramIndex++;
    // }

    // Search filter
    if (search) {
      whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // PHASE 2: Handle ownership-based scope filtering with PRIVACY (multi-tenant)
    // IMPORTANT: Leads support is_private flag - brokers cannot see private leads
    const userRole = req.user?.role;
    const requestedScope = req.query.scope || getDefaultScope(userRole);
    const scope = validateScope(requestedScope, userRole);

    // Build ownership filter with privacy support (no table alias)
    const ownershipFilter = buildOwnershipWhereClause(
      req.user.id,
      userRole,
      req.user.broker_id,
      req.user.team_id || req.user.teamId,
      'lead',
      scope,
      paramIndex
    );

    if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
      whereConditions.push(ownershipFilter.whereClause);
      queryParams.push(...ownershipFilter.params);
      paramIndex = ownershipFilter.nextParamIndex;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM leads ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated data
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT * FROM leads
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await pool.query(dataQuery, queryParams);

    res.json({
      success: true,
      data: {
        leads: dataResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit: parseInt(limit),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch leads',
        details: error.message,
      },
    });
  }
};

// GET /api/v1/leads/:id
exports.getLead = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch lead',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/leads
exports.createLead = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      source,
      notes,
      leadStatus = 'New',
      leadScore = 0,
      leadTemperature = 'Cold',
    } = req.body;

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'First name and last name are required',
        },
      });
    }

    const query = `
      INSERT INTO leads (
        first_name, last_name, email, phone, lead_source,
        notes, lead_status, lead_score, lead_temperature,
        assigned_agent_id, team_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      firstName,
      lastName,
      email || null,
      phone || null,
      source || null,
      notes || null,
      leadStatus,
      leadScore,
      leadTemperature,
      req.user?.id || null,
      req.user?.teamId || req.user?.team_id || null,
    ];

    const result = await pool.query(query, values);
    const newLead = result.rows[0];

    // Emit WebSocket event
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const eventData = { entityType: 'lead', entityId: newLead.id, action: 'created', data: { id: newLead.id } };
    if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
    if (userId) websocketService.sendToUser(userId, 'data:update', eventData);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Lead created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create lead',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'lead_source',
      'lead_status', 'lead_score', 'lead_temperature', 'notes',
      'property_interest', 'budget_range', 'timeline', 'next_follow_up',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid fields to update',
        },
      });
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    setClause.push('last_contact_date = CURRENT_DATE');
    setClause.push('version = version + 1');
    setClause.push(`last_modified_by = $${paramIndex}`);
    values.push(req.user?.id || null);
    paramIndex++;

    // Optimistic locking: check version if provided
    const { version: clientVersion } = updates;
    let versionClause = '';
    if (clientVersion !== undefined) {
      versionClause = ` AND version = $${paramIndex}`;
      values.push(clientVersion);
      paramIndex++;
    }

    values.push(id);

    const query = `
      UPDATE leads
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL${versionClause}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      // Check if record exists but version mismatch
      if (clientVersion !== undefined) {
        const checkQuery = 'SELECT version FROM leads WHERE id = $1 AND deleted_at IS NULL';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Lead not found',
            },
          });
        }
        return res.status(409).json({
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'This lead was modified by another user. Please refresh and try again.',
            currentVersion: checkResult.rows[0].version,
            attemptedVersion: clientVersion,
          },
        });
      }

      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    // Emit WebSocket event
    const updatedLead = result.rows[0];
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const eventData = { entityType: 'lead', entityId: updatedLead.id, action: 'updated', data: { id: updatedLead.id } };
    if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
    if (userId) websocketService.sendToUser(userId, 'data:update', eventData);

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update lead',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/leads/:id/archive
exports.archiveLead = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE leads
      SET deleted_at = CURRENT_TIMESTAMP, lead_status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Lead archived successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error archiving lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive lead',
        details: error.message,
      },
    });
  }
};

// DELETE /api/v1/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead is archived
    const checkQuery = 'SELECT deleted_at FROM leads WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    if (!checkResult.rows[0].deleted_at) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: 'Lead must be archived before deletion',
        },
      });
    }

    const deleteQuery = 'DELETE FROM leads WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    // Emit WebSocket event
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const eventData = { entityType: 'lead', entityId: id, action: 'deleted', data: { id: id } };
    if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
    if (userId) websocketService.sendToUser(userId, 'data:update', eventData);

    res.json({
      success: true,
      message: 'Lead deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete lead',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/leads/:id/convert
exports.convertToClient = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get lead data
    const leadQuery = 'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL';
    const leadResult = await client.query(leadQuery, [id]);

    if (leadResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    const lead = leadResult.rows[0];

    // Create contact first
    const contactQuery = `
      INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone,
        notes, team_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `;

    const contactValues = [
      'buyer', // Default to buyer for converted leads
      lead.first_name,
      lead.last_name,
      lead.email,
      lead.phone,
      `Converted from lead. Original notes: ${lead.notes || 'None'}`,
      lead.team_id,
    ];

    const contactResult = await client.query(contactQuery, contactValues);
    const contactId = contactResult.rows[0].id;

    // Create client from lead
    const clientQuery = `
      INSERT INTO clients (contact_id, client_type, status, created_at, updated_at)
      VALUES ($1, $2, 'active', NOW(), NOW())
      RETURNING *
    `;

    const clientResult = await client.query(clientQuery, [contactId, 'buyer']);
    const newClient = clientResult.rows[0];

    // Update lead with conversion info
    const updateLeadQuery = `
      UPDATE leads
      SET converted_to_client_id = $1, lead_status = 'converted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const updatedLeadResult = await client.query(updateLeadQuery, [newClient.id, id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        client: newClient,
        lead: updatedLeadResult.rows[0],
      },
      message: 'Lead successfully converted to client',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error converting lead to client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERT_ERROR',
        message: 'Failed to convert lead to client',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};

// POST /api/v1/leads/:id/activities
exports.recordActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityType, notes } = req.body;

    // Update last contact date and add notes
    const query = `
      UPDATE leads
      SET
        last_contact_date = CURRENT_DATE,
        notes = CASE
          WHEN notes IS NULL OR notes = '' THEN $1
          ELSE notes || E'\n\n[' || CURRENT_TIMESTAMP || '] ' || $1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;

    const activityNote = `${activityType}: ${notes || 'Contact made'}`;
    const result = await pool.query(query, [activityNote, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Activity recorded successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error recording lead activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ERROR',
        message: 'Failed to record activity',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/leads/batch-delete
exports.batchDeleteLeads = async (req, res) => {
  const client = await pool.connect();

  try {
    const { ids } = req.body;

    await client.query('BEGIN');

    // Check which leads exist and are archived
    const existCheckQuery = `
      SELECT id, deleted_at FROM leads
      WHERE id = ANY($1)
    `;
    const existResult = await client.query(existCheckQuery, [ids]);

    if (existResult.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'No leads found to delete',
        deletedCount: 0,
        deletedIds: [],
      });
    }

    // Check if any are not archived
    const activeLeads = existResult.rows.filter((r) => !r.deleted_at);
    if (activeLeads.length > 0) {
      await client.query('ROLLBACK');
      const activeIds = activeLeads.map((r) => r.id);
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: `Some leads are not archived: ${activeIds.join(', ')}`,
        },
      });
    }

    // Delete archived leads
    const existingIds = existResult.rows.map((r) => r.id);
    const deleteQuery = 'DELETE FROM leads WHERE id = ANY($1) RETURNING id';
    const result = await client.query(deleteQuery, [existingIds]);

    await client.query('COMMIT');

    logger.info('Batch deleted leads', {
      count: result.rowCount,
      ids: result.rows.map((r) => r.id),
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.rowCount} leads`,
      deletedCount: result.rowCount,
      deletedIds: result.rows.map((r) => r.id),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error batch deleting leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to batch delete leads',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};
