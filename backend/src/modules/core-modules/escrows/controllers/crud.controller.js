/**
 * Escrows CRUD Controller
 *
 * Handles core CRUD operations for escrows:
 * - getAllEscrows (GET /escrows)
 * - getEscrowById (GET /escrows/:id)
 * - createEscrow (POST /escrows)
 * - updateEscrow (PUT /escrows/:id)
 * - archiveEscrow (PATCH /escrows/:id/archive)
 * - restoreEscrow (PATCH /escrows/:id/restore)
 * - deleteEscrow (DELETE /escrows/:id)
 * - batchDeleteEscrows (DELETE /escrows/batch)
 */

const { pool } = require('../../../../config/infrastructure/database');
const { buildRestructuredEscrowResponse } = require('../utils/escrows.helper');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../../utils/ownership.helper');
const websocketService = require('../../../../services/websocket.service');
const NotificationService = require('../../../../services/notification.service');
const { detectSchema } = require('../services/schema.service');
const { buildCommissionField } = require('../services/commission.service');

/**
 * Get all escrows with buyers and sellers for list view
 */
async function getAllEscrows(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sort = 'created_at',
      order = 'desc',
      search,
      scope = 'user', // Extract scope parameter (user/team/broker)
    } = req.query;

    // Get user context for filtering
    const userId = req.user?.id;
    const teamId = req.user?.teamId;
    // Normalize role - it might be a string or an array
    const userRole = Array.isArray(req.user?.role) ? req.user.role[0] : req.user?.role;
    const brokerId = req.user?.brokerId;

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
        WHERE deleted_at IS NULL
      `);

      const totalCount = parseInt(tableCheck.rows[0]?.count || 0);

      if (totalCount === 0) {
        return res.json({
          success: true,
          data: {
            escrows: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: 0,
            },
          },
        });
      }
    } catch (tableError) {
      console.error('Table check error:', tableError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'TABLE_ERROR',
          message: 'Escrows table not accessible',
        },
      });
    }

    // Build commission field based on schema
    const commissionField = buildCommissionField(schema);

    // Build acceptance date field based on schema
    let acceptanceDateField;
    if (schema.hasAcceptanceDate && schema.hasOpeningDate) {
      acceptanceDateField = 'COALESCE(acceptance_date, opening_date)';
    } else if (schema.hasAcceptanceDate) {
      acceptanceDateField = 'acceptance_date';
    } else if (schema.hasOpeningDate) {
      acceptanceDateField = 'opening_date';
    } else {
      acceptanceDateField = 'created_at';
    }

    const idField = 'id::text';
    const displayIdField = 'display_id';

    // Base query - clean fields for dashboard (no duplicates)
    let query = `
      SELECT DISTINCT
        e.${idField} as id,
        e.${displayIdField} as display_id,
        e.property_address as property_address,
        e.property_address_display as property_address_display,
        e.city,
        e.state,
        e.zip_code,
        e.closing_date as closing_date,
        e.escrow_status as status,
        e.purchase_price as purchase_price,
        ${commissionField} as my_commission,
        e.commission_percentage,
        e.commission_type,
        e.gross_commission as gross_commission,
        ${acceptanceDateField} as acceptance_date,
        e.created_at as created_at
      FROM escrows e
    `;

    const conditions = ['e.deleted_at IS NULL'];
    const values = [];
    let paramIndex = 1;

    // Filter by status
    if (status && status !== 'all') {
      conditions.push(`e.escrow_status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    // Search filter
    if (search) {
      conditions.push(`(
        e.property_address ILIKE $${paramIndex} OR
        e.${displayIdField} ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // PHASE 2: Handle ownership-based scope filtering (multi-tenant)
    // Build ownership filter using modern helper (escrows table alias is 'e')
    const ownershipFilter = buildOwnershipWhereClauseWithAlias(
      req.user,
      scope,
      'escrow',
      'e',
      paramIndex
    );

    if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
      conditions.push(ownershipFilter.whereClause);
      values.push(...ownershipFilter.params);
      paramIndex = ownershipFilter.nextParamIndex;
    }

    query += ` WHERE ${conditions.join(' AND ')}`;

    // Sorting
    const allowedSortFields = {
      created_at: 'e.created_at',
      closing_date: 'e.closing_date',
      property_address: 'e.property_address',
      purchase_price: 'e.purchase_price',
    };
    const sortField = allowedSortFields[sort] || 'e.created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    // Execute query
    const result = await pool.query(query, values);

    // Get total count and stats for pagination and hero
    let statsQuery = `
      SELECT
        COUNT(DISTINCT e.id) as total,
        COALESCE(SUM(e.purchase_price::numeric), 0) as total_volume,
        COALESCE(SUM((${commissionField})::numeric), 0) as total_commission
      FROM escrows e
      WHERE ${conditions.join(' AND ')}
    `;
    const statsResult = await pool.query(statsQuery, values.slice(0, -2));
    const total = parseInt(statsResult.rows[0]?.total || 0);
    const totalVolume = parseFloat(statsResult.rows[0]?.total_volume || 0);
    const totalCommission = parseFloat(statsResult.rows[0]?.total_commission || 0);

    res.json({
      success: true,
      data: {
        escrows: result.rows,
        stats: {
          total,
          totalVolume,
          totalCommission
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching escrows:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrows',
      },
    });
  }
}

/**
 * Get single escrow by ID
 */
async function getEscrowById(req, res) {
  try {
    let { id } = req.params;

    // Strip the "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    // Detect schema
    const schema = await detectSchema();

    // Determine if ID is UUID format or display format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const commissionField = buildCommissionField(schema);

    // Build query
    let query = `
      SELECT * FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      AND deleted_at IS NULL
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrow',
      },
    });
  }
}

/**
 * Create a new escrow with auto-incrementing ID and helper tables
 */
async function createEscrow(req, res) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const escrowData = req.body;

    // Check if body is empty or not an object
    if (!escrowData || typeof escrowData !== 'object' || Object.keys(escrowData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body cannot be empty',
        },
      });
    }

    // Check for property address in both formats (middleware normalizes to camelCase)
    const propertyAddress = escrowData.propertyAddress || escrowData.property_address;

    // Validate required field
    if (!propertyAddress) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'property_address is required',
        },
      });
    }

    // Generate display_id manually since trigger might not be set up
    const year = new Date().getFullYear();

    // Get the next number for display_id
    const maxNumberResult = await client.query(
      "SELECT MAX(CAST(SUBSTRING(display_id FROM 'ESC-[0-9]+-([0-9]+)') AS INTEGER)) as max_number FROM escrows WHERE display_id LIKE $1",
      [`ESC-${year}-%`],
    );

    const nextNumber = (maxNumberResult.rows[0]?.max_number || 0) + 1;
    const displayId = `ESC-${year}-${String(nextNumber).padStart(4, '0')}`;

    // Build dynamic query with required fields
    const fields = ['property_address', 'display_id', 'purchase_price', 'escrow_status'];
    const values = [
      propertyAddress,
      displayId,
      escrowData.purchasePrice || escrowData.purchase_price || 0,
      escrowData.escrowStatus || escrowData.escrow_status || 'Active',
    ];
    const placeholders = ['$1', '$2', '$3', '$4'];
    let paramIndex = 5;

    // Add optional fields if provided (check both camelCase and snake_case)
    const optionalFields = {
      property_address_display: escrowData.propertyAddressDisplay || escrowData.property_address_display,
      city: escrowData.city,
      state: escrowData.state,
      zip_code: escrowData.zipCode || escrowData.zip_code,
      earnest_money_deposit: escrowData.earnest_money_deposit,
      commission_percentage: escrowData.commission_percentage,
      net_commission: escrowData.net_commission || escrowData.my_commission,
      acceptance_date: escrowData.acceptanceDate || escrowData.acceptance_date,
      closing_date: escrowData.closingDate || escrowData.closing_date,
      property_type: escrowData.property_type,
      escrow_company: escrowData.escrow_company,
      escrow_officer_name: escrowData.escrow_officer_name,
      escrow_officer_email: escrowData.escrow_officer_email,
      escrow_officer_phone: escrowData.escrow_officer_phone,
      loan_officer_name: escrowData.loan_officer_name,
      loan_officer_email: escrowData.loan_officer_email,
      loan_officer_phone: escrowData.loan_officer_phone,
      title_company: escrowData.title_company,
      lead_source: escrowData.lead_source,
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

    await client.query('COMMIT');

    // Get user details for notification
    const userId = req.user?.id;
    const teamId = req.user?.teamId || req.user?.team_id;
    const brokerId = newEscrow.broker_id;

    // Notify broker about new escrow (fire-and-forget)
    if (brokerId && userId) {
      const agent = {
        id: userId,
        first_name: req.user?.first_name || req.user?.firstName || 'Unknown',
        last_name: req.user?.last_name || req.user?.lastName || 'Agent',
      };
      NotificationService.notifyEscrowCreated(newEscrow, agent).catch(err =>
        console.error('Broker notification error:', err)
      );
    }

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const eventData = {
      entityType: 'escrow',
      entityId: newEscrow.id || newEscrow.display_id,
      action: 'created',
      data: {
        id: newEscrow.id || newEscrow.display_id,
        displayId: newEscrow.display_id,
        propertyAddress: newEscrow.property_address,
        propertyAddressDisplay: newEscrow.property_address_display
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

    // Return success
    res.status(201).json({
      success: true,
      data: {
        id: newEscrow.id || newEscrow.display_id,
        displayId: newEscrow.display_id,
        message: 'Escrow created successfully',
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create escrow',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
}

/**
 * Update an existing escrow
 */
async function updateEscrow(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('🔍 UPDATE ESCROW REQUEST:', {
      escrowId: id,
      updates: updates,
      keys: Object.keys(updates),
    });

    // Map camelCase fields to snake_case for database
    const fieldMapping = {
      propertyAddress: 'property_address',
      propertyAddressDisplay: 'property_address_display',
      purchasePrice: 'purchase_price',
      closingDate: 'closing_date',
      acceptanceDate: 'acceptance_date',
      escrowStatus: 'escrow_status',
      escrowOfficerName: 'escrow_officer_name',
      escrowOfficerEmail: 'escrow_officer_email',
      escrowOfficerPhone: 'escrow_officer_phone',
      escrowCompany: 'escrow_company',
      zipCode: 'zip_code',
      earnestMoneyDeposit: 'earnest_money_deposit',
      commissionPercentage: 'commission_percentage',
      netCommission: 'net_commission',
      myCommission: 'net_commission',
      propertyType: 'property_type',
      leadSource: 'lead_source',
      titleCompany: 'title_company',
      loanOfficerName: 'loan_officer_name',
      loanOfficerEmail: 'loan_officer_email',
      loanOfficerPhone: 'loan_officer_phone',
    };

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (key !== 'id' && key !== 'display_id' && key !== 'created_at') {
        const dbFieldName = fieldMapping[key] || key;

        // Handle JSONB fields
        let value = updates[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if (['people', 'checklists', 'timeline'].includes(dbFieldName)) {
            value = JSON.stringify(value);
          }
        }

        updateFields.push(`${dbFieldName} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No fields to update',
        },
      });
    }

    // Strip the "escrow-" prefix if present
    let cleanId = id;
    if (id.startsWith('escrow-')) {
      cleanId = id.substring(7);
    }

    // Determine if ID is UUID format or display format
    const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    values.push(cleanId);

    // Optimistic locking: check version if provided
    const { version: clientVersion } = req.body;
    let versionClause = '';
    if (clientVersion !== undefined) {
      paramIndex++;
      values.push(clientVersion);
      versionClause = ` AND version = $${paramIndex}`;
    }

    const updateQuery = `
      UPDATE escrows
      SET ${updateFields.join(', ')},
          updated_at = NOW(),
          version = version + 1,
          last_modified_by = $${paramIndex + 1}
      WHERE ${isUUIDFormat ? `id = $${paramIndex - (clientVersion !== undefined ? 1 : 0)}` : `display_id = $${paramIndex - (clientVersion !== undefined ? 1 : 0)}`}${versionClause}
      RETURNING *
    `;

    values.push(req.user?.id || null);

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      // Check if record exists but version mismatch
      const checkQuery = `
        SELECT version FROM escrows
        WHERE ${isUUIDFormat ? 'id' : 'display_id'} = $1
      `;
      const checkResult = await client.query(checkQuery, [cleanId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found',
          },
        });
      }
      return res.status(409).json({
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: 'This escrow was modified by another user. Please refresh and try again.',
          currentVersion: checkResult.rows[0].version,
          attemptedVersion: clientVersion,
        },
      });
    }

    const updatedEscrow = result.rows[0];

    // Get user/team/broker details for notifications
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const brokerId = updatedEscrow.broker_id;

    // Notify broker if escrow was just closed (fire-and-forget)
    if (brokerId && userId && updates.escrowStatus === 'closed' && updatedEscrow.escrow_status === 'closed') {
      const agent = {
        id: userId,
        first_name: req.user?.first_name || req.user?.firstName || 'Unknown',
        last_name: req.user?.last_name || req.user?.lastName || 'Agent',
      };
      NotificationService.notifyEscrowClosed(updatedEscrow, agent).catch(err =>
        console.error('Broker notification error:', err)
      );
    }

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const eventData = {
      entityType: 'escrow',
      entityId: updatedEscrow.id || updatedEscrow.display_id,
      action: 'updated',
      data: {
        id: updatedEscrow.id || updatedEscrow.display_id,
        displayId: updatedEscrow.display_id,
        propertyAddress: updatedEscrow.property_address,
        propertyAddressDisplay: updatedEscrow.property_address_display
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
      data: updatedEscrow,
      message: 'Escrow updated successfully',
    });
  } catch (error) {
    console.error('Error updating escrow:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack,
      updates: req.body,
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message || 'Failed to update escrow',
        details: process.env.NODE_ENV === 'development' ? error.detail : undefined,
      },
    });
  } finally {
    client.release();
  }
}

/**
 * Archive an escrow (soft delete)
 */
async function archiveEscrow(req, res) {
  try {
    const { id } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const result = await pool.query(
      `UPDATE escrows
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
       AND deleted_at IS NULL
       RETURNING display_id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found or already archived',
        },
      });
    }

    res.json({
      success: true,
      message: 'Escrow archived successfully',
      data: { displayId: result.rows[0].display_id },
    });
  } catch (error) {
    console.error('Error archiving escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive escrow',
        details: error.message,
      },
    });
  }
}

/**
 * Restore an archived escrow
 */
async function restoreEscrow(req, res) {
  try {
    const { id } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const result = await pool.query(
      `UPDATE escrows
       SET deleted_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
       AND deleted_at IS NOT NULL
       RETURNING display_id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found in archives',
        },
      });
    }

    res.json({
      success: true,
      message: 'Escrow restored successfully',
      data: { displayId: result.rows[0].display_id },
    });
  } catch (error) {
    console.error('Error restoring escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESTORE_ERROR',
        message: 'Failed to restore escrow',
        details: error.message,
      },
    });
  }
}

/**
 * Permanently delete an escrow (hard delete)
 */
async function deleteEscrow(req, res) {
  try {
    const { id } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Only allow permanent delete of archived escrows
    const result = await pool.query(
      `DELETE FROM escrows
       WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
       AND deleted_at IS NOT NULL
       RETURNING display_id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found in archives. Only archived escrows can be permanently deleted.',
        },
      });
    }

    // Emit WebSocket event for real-time updates
    const teamId = req.user?.teamId || req.user?.team_id;
    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', {
        entityType: 'escrow',
        entityId: id,
        action: 'deleted',
        data: {
          displayId: result.rows[0].display_id
        }
      });
    }

    res.json({
      success: true,
      message: 'Escrow permanently deleted',
      data: { displayId: result.rows[0].display_id },
    });
  } catch (error) {
    console.error('Error permanently deleting escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to permanently delete escrow',
        details: error.message,
      },
    });
  }
}

/**
 * Batch delete multiple escrows (hard delete)
 */
async function batchDeleteEscrows(req, res) {
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

    // Verify all escrows exist and are archived
    const verifyQuery = `
      SELECT id, display_id, property_address
      FROM escrows
      WHERE (id = ANY($1) OR display_id = ANY($1))
      AND deleted_at IS NOT NULL
    `;

    const verifyResult = await client.query(verifyQuery, [ids]);

    if (verifyResult.rows.length !== ids.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Some escrows not found or not archived. Only archived escrows can be deleted.',
          details: {
            requested: ids.length,
            found: verifyResult.rows.length,
          },
        },
      });
    }

    // Delete all escrows
    const deleteQuery = `
      DELETE FROM escrows
      WHERE (id = ANY($1) OR display_id = ANY($1))
      AND deleted_at IS NOT NULL
      RETURNING id, display_id, property_address
    `;

    const deleteResult = await client.query(deleteQuery, [ids]);

    await client.query('COMMIT');

    return res.json({
      success: true,
      data: {
        deleted: deleteResult.rows.length,
        escrows: deleteResult.rows,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in batch delete escrows:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_DELETE_ERROR',
        message: 'Failed to delete escrows',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
}

module.exports = {
  getAllEscrows,
  getEscrowById,
  createEscrow,
  updateEscrow,
  archiveEscrow,
  restoreEscrow,
  deleteEscrow,
  batchDeleteEscrows,
};
