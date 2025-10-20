/**
 * Checklist Templates Controller
 *
 * Manages reusable checklist templates that can be applied to entities.
 * Templates define best-practice workflows that turn into tasks when applied.
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /v1/checklist-templates
 * List all checklist templates with optional filtering
 */
const getAllTemplates = async (req, res) => {
  const { entity_type, category, is_default, is_system } = req.query;
  const userId = req.user.id;
  const teamId = req.user.team_id;

  try {
    let query = `
      SELECT
        id,
        name,
        description,
        entity_type,
        category,
        items,
        is_default,
        is_system,
        created_by,
        team_id,
        created_at,
        updated_at
      FROM checklist_templates
      WHERE deleted_at IS NULL
        AND (team_id = $1 OR is_system = TRUE)
    `;
    const params = [teamId];
    let paramCount = 1;

    // Add filters
    if (entity_type) {
      paramCount++;
      query += ` AND entity_type = $${paramCount}`;
      params.push(entity_type);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (is_default !== undefined) {
      paramCount++;
      query += ` AND is_default = $${paramCount}`;
      params.push(is_default === 'true');
    }

    if (is_system !== undefined) {
      paramCount++;
      query += ` AND is_system = $${paramCount}`;
      params.push(is_system === 'true');
    }

    query += ` ORDER BY is_system DESC, category ASC, name ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching checklist templates:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TEMPLATES_ERROR',
        message: 'Failed to fetch checklist templates'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/checklist-templates/:id
 * Get a single checklist template by ID
 */
const getTemplateById = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        description,
        entity_type,
        category,
        items,
        is_default,
        is_system,
        created_by,
        team_id,
        created_at,
        updated_at
      FROM checklist_templates
      WHERE id = $1
        AND deleted_at IS NULL
        AND (team_id = $2 OR is_system = TRUE)`,
      [id, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Checklist template not found'
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
    console.error('Error fetching checklist template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TEMPLATE_ERROR',
        message: 'Failed to fetch checklist template'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /v1/checklist-templates
 * Create a new custom checklist template
 */
const createTemplate = async (req, res) => {
  const { name, description, entity_type, category, items, is_default } = req.body;
  const userId = req.user.id;
  const teamId = req.user.team_id;

  // Validation
  if (!name || !entity_type || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name, entity_type, and items array are required'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Validate items structure
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.text || item.position === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Item ${i + 1} must have 'text' and 'position' fields`
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  try {
    const templateId = uuidv4();

    const result = await pool.query(
      `INSERT INTO checklist_templates (
        id,
        name,
        description,
        entity_type,
        category,
        items,
        is_default,
        is_system,
        created_by,
        team_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        templateId,
        name,
        description || null,
        entity_type,
        category || null,
        JSON.stringify(items),
        is_default || false,
        false, // Custom templates are never system templates
        userId,
        teamId
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating checklist template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_TEMPLATE_ERROR',
        message: 'Failed to create checklist template'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * PUT /v1/checklist-templates/:id
 * Update a checklist template
 */
const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, description, entity_type, category, items, is_default } = req.body;
  const teamId = req.user.team_id;

  try {
    // Check if template exists and is not a system template
    const checkResult = await pool.query(
      `SELECT is_system, team_id FROM checklist_templates
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Checklist template not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const template = checkResult.rows[0];

    // Prevent editing system templates
    if (template.is_system) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SYSTEM_TEMPLATE_READONLY',
          message: 'System templates cannot be modified. Create a custom copy instead.'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Prevent editing other teams' templates
    if (template.team_id !== teamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this template'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${paramCount++}`);
    }

    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${paramCount++}`);
    }

    if (entity_type !== undefined) {
      params.push(entity_type);
      updates.push(`entity_type = $${paramCount++}`);
    }

    if (category !== undefined) {
      params.push(category);
      updates.push(`category = $${paramCount++}`);
    }

    if (items !== undefined) {
      params.push(JSON.stringify(items));
      updates.push(`items = $${paramCount++}`);
    }

    if (is_default !== undefined) {
      params.push(is_default);
      updates.push(`is_default = $${paramCount++}`);
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

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE checklist_templates
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating checklist template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_TEMPLATE_ERROR',
        message: 'Failed to update checklist template'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * DELETE /v1/checklist-templates/:id
 * Soft delete a checklist template (system templates cannot be deleted)
 */
const deleteTemplate = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    // Check if template exists and is not a system template
    const checkResult = await pool.query(
      `SELECT is_system, team_id FROM checklist_templates
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Checklist template not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const template = checkResult.rows[0];

    // Prevent deleting system templates
    if (template.is_system) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SYSTEM_TEMPLATE_READONLY',
          message: 'System templates cannot be deleted'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Prevent deleting other teams' templates
    if (template.team_id !== teamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this template'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete
    await pool.query(
      `UPDATE checklist_templates
      SET deleted_at = NOW()
      WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: { message: 'Checklist template deleted successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting checklist template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_TEMPLATE_ERROR',
        message: 'Failed to delete checklist template'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
