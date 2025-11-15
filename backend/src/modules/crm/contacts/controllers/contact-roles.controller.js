const db = require('../../../../config/database');

/**
 * Contact Roles Controller
 * Manages contact role definitions (lead, client, vendor types, etc.)
 */

/**
 * GET /v1/contact-roles
 * List all available contact roles
 */
exports.list = async (req, res) => {
  try {
    const { active_only = 'true' } = req.query;

    let query = `
      SELECT
        id,
        role_name,
        display_name,
        description,
        icon,
        color,
        required_fields,
        optional_fields,
        hidden_fields,
        is_lead_type,
        lead_category,
        sort_order,
        is_active
      FROM contact_roles
    `;

    const conditions = [];
    const values = [];

    if (active_only === 'true') {
      conditions.push('is_active = true');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sort_order ASC, display_name ASC';

    const result = await db.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error listing contact roles:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list contact roles'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/contact-roles/:id
 * Get specific contact role by ID
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        id,
        role_name,
        display_name,
        description,
        icon,
        color,
        required_fields,
        optional_fields,
        hidden_fields,
        is_lead_type,
        lead_category,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM contact_roles
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact role not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting contact role:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get contact role'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /v1/contact-roles
 * Create new contact role (admin only - future feature)
 */
exports.create = async (req, res) => {
  try {
    // TODO: Add admin authorization check
    const {
      role_name,
      display_name,
      description,
      icon,
      color,
      required_fields = [],
      optional_fields = [],
      hidden_fields = [],
      is_lead_type = false,
      lead_category = null,
      sort_order = 999
    } = req.body;

    // Validation
    if (!role_name || !display_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'role_name and display_name are required'
        },
        timestamp: new Date().toISOString()
      });
    }

    const query = `
      INSERT INTO contact_roles (
        role_name,
        display_name,
        description,
        icon,
        color,
        required_fields,
        optional_fields,
        hidden_fields,
        is_lead_type,
        lead_category,
        sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      role_name,
      display_name,
      description,
      icon,
      color,
      JSON.stringify(required_fields),
      JSON.stringify(optional_fields),
      JSON.stringify(hidden_fields),
      is_lead_type,
      lead_category,
      sort_order
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating contact role:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ROLE',
          message: 'A role with this name already exists'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create contact role'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * PUT /v1/contact-roles/:id
 * Update contact role (admin only - future feature)
 */
exports.update = async (req, res) => {
  try {
    // TODO: Add admin authorization check
    const { id } = req.params;
    const {
      display_name,
      description,
      icon,
      color,
      required_fields,
      optional_fields,
      hidden_fields,
      is_active,
      sort_order
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (display_name !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(display_name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (required_fields !== undefined) {
      updates.push(`required_fields = $${paramCount++}`);
      values.push(JSON.stringify(required_fields));
    }
    if (optional_fields !== undefined) {
      updates.push(`optional_fields = $${paramCount++}`);
      values.push(JSON.stringify(optional_fields));
    }
    if (hidden_fields !== undefined) {
      updates.push(`hidden_fields = $${paramCount++}`);
      values.push(JSON.stringify(hidden_fields));
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount++}`);
      values.push(sort_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        },
        timestamp: new Date().toISOString()
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE contact_roles
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact role not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating contact role:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update contact role'
      },
      timestamp: new Date().toISOString()
    });
  }
};
