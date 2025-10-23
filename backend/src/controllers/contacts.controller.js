const pool = require('../config/database');

// GET /contacts - List all contacts
exports.list = async (req, res) => {
  try {
    const {
      type,
      search,
      archived = false,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        id, user_id, team_id, broker_id,
        first_name, last_name, email, phone, phone_secondary,
        contact_type, company, license_number,
        street_address, city, state, zip_code,
        notes, tags, is_archived, created_at, updated_at
      FROM contacts
      WHERE user_id = $1 AND is_archived = $2
    `;

    const params = [req.user.id, archived === 'true'];
    let paramCount = 2;

    // Filter by type
    if (type) {
      paramCount++;
      query += ` AND contact_type = $${paramCount}`;
      params.push(type);
    }

    // Full text search
    if (search) {
      paramCount++;
      query += ` AND search_vector @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
    }

    // Ordering and pagination
    query += ` ORDER BY last_name, first_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM contacts WHERE user_id = $1 AND is_archived = $2`;
    const countParams = [req.user.id, archived === 'true'];

    if (type) {
      countQuery += ` AND contact_type = $3`;
      countParams.push(type);
    }

    if (search) {
      const searchParamIndex = countParams.length + 1;
      countQuery += ` AND search_vector @@ plainto_tsquery('english', $${searchParamIndex})`;
      countParams.push(search);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < parseInt(countResult.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Error listing contacts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list contacts' }
    });
  }
};

// GET /contacts/:id - Get single contact
exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get contact' }
    });
  }
};

// POST /contacts - Create contact
exports.create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      phone_secondary,
      contact_type,
      company,
      license_number,
      street_address,
      city,
      state,
      zip_code,
      notes,
      tags
    } = req.body;

    // Validation
    if (!first_name || !last_name || !contact_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'First name, last name, and contact type are required'
        }
      });
    }

    const result = await pool.query(
      `INSERT INTO contacts (
        user_id, team_id, broker_id,
        first_name, last_name, email, phone, phone_secondary,
        contact_type, company, license_number,
        street_address, city, state, zip_code,
        notes, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.id,
        req.user.team_id,
        req.user.broker_id,
        first_name,
        last_name,
        email,
        phone,
        phone_secondary,
        contact_type,
        company,
        license_number,
        street_address,
        city,
        state,
        zip_code,
        notes,
        tags || []
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create contact' }
    });
  }
};

// PUT /contacts/:id - Update contact
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'phone_secondary',
      'contact_type', 'company', 'license_number',
      'street_address', 'city', 'state', 'zip_code',
      'notes', 'tags'
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' }
      });
    }

    values.push(id, req.user.id);

    const result = await pool.query(
      `UPDATE contacts SET ${setClause.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update contact' }
    });
  }
};

// PATCH /contacts/:id/archive - Archive contact
exports.archive = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE contacts
       SET is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error archiving contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to archive contact' }
    });
  }
};

// PATCH /contacts/:id/unarchive - Unarchive contact
exports.unarchive = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE contacts
       SET is_archived = FALSE, archived_at = NULL, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error unarchiving contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to unarchive contact' }
    });
  }
};

// DELETE /contacts/:id - Delete contact
exports.delete = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete contact' }
    });
  }
};

// ============================================================================
// MULTI-ROLE CONTACT METHODS
// ============================================================================

/**
 * GET /contacts/search?role=lead_buyer&name=john
 * Search contacts by role and name/email
 */
exports.search = async (req, res) => {
  try {
    const { role, name, email, limit = 50 } = req.query;

    let query = `
      SELECT DISTINCT
        c.id,
        c.first_name,
        c.last_name,
        c.full_name,
        c.email,
        c.phone,
        c.company,
        c.license_number,
        c.created_at
      FROM contacts c
    `;

    const conditions = ['c.user_id = $1', 'c.deleted_at IS NULL'];
    const values = [req.user.id];
    let paramCount = 1;

    // Filter by role
    if (role) {
      query += `
        JOIN contact_role_assignments cra ON c.id = cra.contact_id
        JOIN contact_roles cr ON cra.role_id = cr.id
      `;
      paramCount++;
      conditions.push(`cr.role_name = $${paramCount}`);
      conditions.push('cra.is_active = true');
      values.push(role);
    }

    // Search by name
    if (name) {
      paramCount++;
      conditions.push(`c.full_name ILIKE $${paramCount}`);
      values.push(`%${name}%`);
    }

    // Search by email
    if (email) {
      paramCount++;
      conditions.push(`c.email ILIKE $${paramCount}`);
      values.push(`%${email}%`);
    }

    query += ' WHERE ' + conditions.join(' AND ');
    query += ` ORDER BY c.full_name ASC LIMIT $${paramCount + 1}`;
    values.push(limit);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to search contacts' }
    });
  }
};

/**
 * GET /contacts/:id/roles
 * Get all roles for a specific contact
 */
exports.getRoles = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        cr.id AS role_id,
        cr.role_name,
        cr.display_name,
        cr.color,
        cr.icon,
        cra.is_primary,
        cra.role_metadata,
        cra.assigned_at,
        cra.is_active
      FROM contact_role_assignments cra
      JOIN contact_roles cr ON cra.role_id = cr.id
      WHERE cra.contact_id = $1
        AND cra.is_active = true
      ORDER BY cra.is_primary DESC, cra.assigned_at ASC
    `;

    const result = await pool.query(query, [id]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting contact roles:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get contact roles' }
    });
  }
};

/**
 * POST /contacts/:id/roles
 * Add a new role to an existing contact
 */
exports.addRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, role_metadata = {}, is_primary = false } = req.body;

    // Validation
    if (!role_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'role_id is required' }
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If setting as primary, unset all other primary roles
      if (is_primary) {
        await client.query(
          'UPDATE contact_role_assignments SET is_primary = false WHERE contact_id = $1',
          [id]
        );
      }

      // Insert new role assignment
      const insertQuery = `
        INSERT INTO contact_role_assignments (
          contact_id,
          role_id,
          role_metadata,
          is_primary,
          assigned_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        id,
        role_id,
        JSON.stringify(role_metadata),
        is_primary,
        req.user.id
      ]);

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: result.rows[0],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error adding contact role:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_ROLE', message: 'Contact already has this role' }
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add contact role' }
    });
  }
};

/**
 * DELETE /contacts/:id/roles/:roleId
 * Remove a role from a contact
 */
exports.removeRole = async (req, res) => {
  try {
    const { id, roleId } = req.params;

    // Check if this is the only role
    const countQuery = 'SELECT COUNT(*) FROM contact_role_assignments WHERE contact_id = $1 AND is_active = true';
    const countResult = await pool.query(countQuery, [id]);

    if (parseInt(countResult.rows[0].count) <= 1) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot remove last role from contact' }
      });
    }

    // Soft delete (set is_active = false)
    const query = `
      UPDATE contact_role_assignments
      SET is_active = false, archived_at = CURRENT_TIMESTAMP
      WHERE contact_id = $1 AND role_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, roleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Role assignment not found' }
      });
    }

    res.json({
      success: true,
      message: 'Role removed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error removing contact role:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to remove contact role' }
    });
  }
};

/**
 * PUT /contacts/:id/roles/primary
 * Set a specific role as the primary role
 */
exports.setPrimaryRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'role_id is required' }
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Unset all primary flags for this contact
      await client.query(
        'UPDATE contact_role_assignments SET is_primary = false WHERE contact_id = $1',
        [id]
      );

      // Set new primary role
      const result = await client.query(
        'UPDATE contact_role_assignments SET is_primary = true WHERE contact_id = $1 AND role_id = $2 RETURNING *',
        [id, role_id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Role assignment not found' }
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Primary role updated successfully',
        data: result.rows[0],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error setting primary role:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to set primary role' }
    });
  }
};

module.exports = exports;