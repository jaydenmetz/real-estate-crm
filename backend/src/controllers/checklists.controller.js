/**
 * Checklists Controller
 *
 * Manages checklist instances applied to specific entities (escrows, listings, clients).
 * When a checklist is created from a template, it automatically generates tasks.
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /v1/checklists
 * Create a new checklist from a template
 * Automatically creates tasks from template items
 */
const createChecklist = async (req, res) => {
  const { template_id, entity_type, entity_id, name, custom_name } = req.body;
  const userId = req.user.id;
  const teamId = req.user.team_id;

  // Validation
  if (!template_id || !entity_type || !entity_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'template_id, entity_type, and entity_id are required'
      },
      timestamp: new Date().toISOString()
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Fetch template
    const templateResult = await client.query(
      `SELECT * FROM checklist_templates
      WHERE id = $1 AND deleted_at IS NULL
        AND (team_id = $2 OR is_system = TRUE)`,
      [template_id, teamId]
    );

    if (templateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Checklist template not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const template = templateResult.rows[0];
    const checklistId = uuidv4();
    const checklistName = custom_name || name || template.name;

    // Create checklist instance
    const checklistResult = await client.query(
      `INSERT INTO checklists (
        id,
        template_id,
        entity_type,
        entity_id,
        name,
        status,
        progress_percentage,
        created_by,
        team_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        checklistId,
        template_id,
        entity_type,
        entity_id,
        checklistName,
        'active',
        0,
        userId,
        teamId
      ]
    );

    const checklist = checklistResult.rows[0];

    // Create tasks from template items
    const items = template.items || [];
    const createdTasks = [];

    for (const item of items) {
      const taskId = uuidv4();
      const dueDate = item.auto_due_days !== undefined
        ? new Date(Date.now() + item.auto_due_days * 24 * 60 * 60 * 1000)
        : null;

      const taskResult = await client.query(
        `INSERT INTO tasks (
          id,
          name,
          checklist_id,
          checklist_position,
          status,
          priority,
          due_date,
          estimated_hours,
          related_entity_type,
          related_entity_id,
          assigned_to,
          created_by,
          team_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          taskId,
          item.text,
          checklistId,
          item.position,
          'not-started',
          item.priority || 'medium',
          dueDate,
          item.estimated_hours || null,
          entity_type,
          entity_id,
          userId, // Auto-assign to creator (can be changed later)
          userId,
          teamId
        ]
      );

      createdTasks.push(taskResult.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        checklist,
        tasks: createdTasks
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CHECKLIST_ERROR',
        message: 'Failed to create checklist'
      },
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};

/**
 * GET /v1/checklists
 * List all checklists with optional filtering
 */
const getAllChecklists = async (req, res) => {
  const { entity_type, entity_id, status } = req.query;
  const teamId = req.user.team_id;

  try {
    let query = `
      SELECT
        c.*,
        t.name as template_name,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE checklist_id = c.id AND deleted_at IS NULL
        ) as total_tasks,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE checklist_id = c.id AND status = 'completed' AND deleted_at IS NULL
        ) as completed_tasks
      FROM checklists c
      LEFT JOIN checklist_templates t ON c.template_id = t.id
      WHERE c.deleted_at IS NULL
        AND c.team_id = $1
    `;
    const params = [teamId];
    let paramCount = 1;

    if (entity_type) {
      paramCount++;
      query += ` AND c.entity_type = $${paramCount}`;
      params.push(entity_type);
    }

    if (entity_id) {
      paramCount++;
      query += ` AND c.entity_id = $${paramCount}`;
      params.push(entity_id);
    }

    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching checklists:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CHECKLISTS_ERROR',
        message: 'Failed to fetch checklists'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/checklists/entity/:type/:id
 * Get all checklists for a specific entity
 */
const getChecklistsByEntity = async (req, res) => {
  const { type, id } = req.params;
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `SELECT
        c.*,
        t.name as template_name,
        t.category as template_category,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE checklist_id = c.id AND deleted_at IS NULL
        ) as total_tasks,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE checklist_id = c.id AND status = 'completed' AND deleted_at IS NULL
        ) as completed_tasks
      FROM checklists c
      LEFT JOIN checklist_templates t ON c.template_id = t.id
      WHERE c.entity_type = $1
        AND c.entity_id = $2
        AND c.team_id = $3
        AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC`,
      [type, id, teamId]
    );

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching checklists by entity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ENTITY_CHECKLISTS_ERROR',
        message: 'Failed to fetch checklists for entity'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/checklists/:id
 * Get a single checklist with all its tasks
 */
const getChecklistById = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    // Fetch checklist
    const checklistResult = await pool.query(
      `SELECT
        c.*,
        t.name as template_name,
        t.category as template_category
      FROM checklists c
      LEFT JOIN checklist_templates t ON c.template_id = t.id
      WHERE c.id = $1
        AND c.team_id = $2
        AND c.deleted_at IS NULL`,
      [id, teamId]
    );

    if (checklistResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHECKLIST_NOT_FOUND',
          message: 'Checklist not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const checklist = checklistResult.rows[0];

    // Fetch all tasks for this checklist
    const tasksResult = await pool.query(
      `SELECT * FROM tasks
      WHERE checklist_id = $1
        AND deleted_at IS NULL
      ORDER BY checklist_position ASC, created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...checklist,
        tasks: tasksResult.rows
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CHECKLIST_ERROR',
        message: 'Failed to fetch checklist'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * PUT /v1/checklists/:id
 * Update a checklist (name, status)
 */
const updateChecklist = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;
  const teamId = req.user.team_id;

  try {
    // Check if checklist exists
    const checkResult = await pool.query(
      `SELECT team_id FROM checklists
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHECKLIST_NOT_FOUND',
          message: 'Checklist not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (checkResult.rows[0].team_id !== teamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this checklist'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Build update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${paramCount++}`);
    }

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);
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
      UPDATE checklists
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
    console.error('Error updating checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CHECKLIST_ERROR',
        message: 'Failed to update checklist'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * DELETE /v1/checklists/:id
 * Soft delete a checklist (cascades to tasks via trigger)
 */
const deleteChecklist = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    // Check if checklist exists
    const checkResult = await pool.query(
      `SELECT team_id FROM checklists
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHECKLIST_NOT_FOUND',
          message: 'Checklist not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (checkResult.rows[0].team_id !== teamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this checklist'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete checklist and all its tasks
    await pool.query(
      `UPDATE checklists SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );

    await pool.query(
      `UPDATE tasks SET deleted_at = NOW() WHERE checklist_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: { message: 'Checklist and all associated tasks deleted successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CHECKLIST_ERROR',
        message: 'Failed to delete checklist'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  createChecklist,
  getAllChecklists,
  getChecklistsByEntity,
  getChecklistById,
  updateChecklist,
  deleteChecklist
};
