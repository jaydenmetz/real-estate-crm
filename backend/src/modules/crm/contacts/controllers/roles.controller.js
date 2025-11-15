/**
 * Contacts Roles Controller
 *
 * Handles multi-role contact operations:
 * - Get all roles for a contact
 * - Add new role to a contact
 * - Remove role from a contact
 * - Set primary role for a contact
 *
 * Supports the multi-role contact system where contacts can have
 * multiple roles (e.g., lead_buyer, client, investor) with metadata
 * and primary role designation.
 */

const pool = require('../../../../config/database');

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

      // Auto-fill logic: If adding "client" role, inherit source from lead role
      let finalMetadata = { ...role_metadata };

      // Check if we're adding a client role
      const roleCheck = await client.query(
        'SELECT role_name FROM contact_roles WHERE id = $1',
        [role_id]
      );

      if (roleCheck.rows.length > 0 && roleCheck.rows[0].role_name === 'client') {
        // Look for existing lead roles (lead_buyer or lead_seller)
        const leadQuery = `
          SELECT cra.role_metadata
          FROM contact_role_assignments cra
          JOIN contact_roles cr ON cra.role_id = cr.id
          WHERE cra.contact_id = $1
            AND cr.role_name IN ('lead_buyer', 'lead_seller')
            AND cra.is_active = true
          ORDER BY cra.assigned_at DESC
          LIMIT 1
        `;

        const leadResult = await client.query(leadQuery, [id]);

        // If lead exists and has source, inherit it
        if (leadResult.rows.length > 0) {
          const leadMetadata = leadResult.rows[0].role_metadata || {};
          if (leadMetadata.source && !finalMetadata.source) {
            finalMetadata.source = leadMetadata.source;
          }
        }
      }

      // If setting as primary, unset all other primary roles
      if (is_primary) {
        await client.query(
          'UPDATE contact_role_assignments SET is_primary = false WHERE contact_id = $1',
          [id]
        );
      }

      // Insert new role assignment with auto-filled metadata
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
        JSON.stringify(finalMetadata),
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
