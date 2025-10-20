/**
 * Tasks Controller
 *
 * Manages tasks with support for:
 * - Standalone tasks (project-based)
 * - Checklist tasks (checklist-based)
 * - Entity-related tasks (escrows, listings, clients)
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /v1/tasks
 * List all tasks with optional filtering
 */
const getAllTasks = async (req, res) => {
  const {
    project_id,
    checklist_id,
    status,
    priority,
    assigned_to,
    related_entity_type,
    related_entity_id
  } = req.query;
  const teamId = req.user.team_id;
  const userId = req.user.id;

  try {
    let query = `
      SELECT
        t.*,
        p.name as project_name,
        c.name as checklist_name,
        c.entity_type as checklist_entity_type,
        c.entity_id as checklist_entity_id,
        u.username as assigned_to_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN checklists c ON t.checklist_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.deleted_at IS NULL
        AND t.team_id = $1
    `;
    const params = [teamId];
    let paramCount = 1;

    // Add filters
    if (project_id) {
      paramCount++;
      query += ` AND t.project_id = $${paramCount}`;
      params.push(project_id);
    }

    if (checklist_id) {
      paramCount++;
      query += ` AND t.checklist_id = $${paramCount}`;
      params.push(checklist_id);
    }

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND t.priority = $${paramCount}`;
      params.push(priority);
    }

    if (assigned_to) {
      paramCount++;
      query += ` AND t.assigned_to = $${paramCount}`;
      params.push(assigned_to);
    }

    if (related_entity_type) {
      paramCount++;
      query += ` AND t.related_entity_type = $${paramCount}`;
      params.push(related_entity_type);
    }

    if (related_entity_id) {
      paramCount++;
      query += ` AND t.related_entity_id = $${paramCount}`;
      params.push(related_entity_id);
    }

    query += ` ORDER BY
      CASE t.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TASKS_ERROR',
        message: 'Failed to fetch tasks'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/tasks/my-tasks
 * Get tasks assigned to current user
 */
const getMyTasks = async (req, res) => {
  const { status } = req.query;
  const userId = req.user.id;
  const teamId = req.user.team_id;

  try {
    let query = `
      SELECT
        t.*,
        p.name as project_name,
        c.name as checklist_name,
        c.entity_type as checklist_entity_type,
        c.entity_id as checklist_entity_id
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN checklists c ON t.checklist_id = c.id
      WHERE t.deleted_at IS NULL
        AND t.team_id = $1
        AND t.assigned_to = $2
    `;
    const params = [teamId, userId];
    let paramCount = 2;

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY
      CASE t.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_MY_TASKS_ERROR',
        message: 'Failed to fetch your tasks'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/tasks/overdue
 * Get overdue tasks
 */
const getOverdueTasks = async (req, res) => {
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `SELECT
        t.*,
        p.name as project_name,
        c.name as checklist_name,
        u.username as assigned_to_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN checklists c ON t.checklist_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.deleted_at IS NULL
        AND t.team_id = $1
        AND t.status != 'completed'
        AND t.due_date < NOW()
      ORDER BY t.due_date ASC`,
      [teamId]
    );

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_OVERDUE_TASKS_ERROR',
        message: 'Failed to fetch overdue tasks'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/tasks/:id
 * Get a single task by ID
 */
const getTaskById = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `SELECT
        t.*,
        p.name as project_name,
        c.name as checklist_name,
        u.username as assigned_to_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN checklists c ON t.checklist_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = $1
        AND t.team_id = $2
        AND t.deleted_at IS NULL`,
      [id, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
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
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TASK_ERROR',
        message: 'Failed to fetch task'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /v1/tasks
 * Create a new standalone task
 */
const createTask = async (req, res) => {
  const {
    name,
    description,
    project_id,
    parent_task_id,
    related_entity_type,
    related_entity_id,
    status,
    priority,
    due_date,
    estimated_hours,
    assigned_to
  } = req.body;
  const userId = req.user.id;
  const teamId = req.user.team_id;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Task name is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  try {
    const taskId = uuidv4();

    const result = await pool.query(
      `INSERT INTO tasks (
        id,
        name,
        description,
        project_id,
        parent_task_id,
        related_entity_type,
        related_entity_id,
        status,
        priority,
        due_date,
        estimated_hours,
        assigned_to,
        created_by,
        team_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        taskId,
        name,
        description || null,
        project_id || null,
        parent_task_id || null,
        related_entity_type || null,
        related_entity_id || null,
        status || 'not-started',
        priority || 'medium',
        due_date || null,
        estimated_hours || null,
        assigned_to || userId,
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
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_TASK_ERROR',
        message: 'Failed to create task'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * PUT /v1/tasks/:id
 * Update a task
 */
const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    status,
    priority,
    due_date,
    estimated_hours,
    actual_hours,
    assigned_to
  } = req.body;
  const teamId = req.user.team_id;

  try {
    // Check if task exists
    const checkResult = await pool.query(
      `SELECT team_id, checklist_id FROM tasks
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (checkResult.rows[0].team_id !== teamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this task'
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

    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${paramCount++}`);
    }

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);

      // Auto-set completed_at when status changes to completed
      if (status === 'completed') {
        updates.push(`completed_at = NOW()`);
      } else {
        updates.push(`completed_at = NULL`);
      }
    }

    if (priority !== undefined) {
      params.push(priority);
      updates.push(`priority = $${paramCount++}`);
    }

    if (due_date !== undefined) {
      params.push(due_date);
      updates.push(`due_date = $${paramCount++}`);
    }

    if (estimated_hours !== undefined) {
      params.push(estimated_hours);
      updates.push(`estimated_hours = $${paramCount++}`);
    }

    if (actual_hours !== undefined) {
      params.push(actual_hours);
      updates.push(`actual_hours = $${paramCount++}`);
    }

    if (assigned_to !== undefined) {
      params.push(assigned_to);
      updates.push(`assigned_to = $${paramCount++}`);
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
      UPDATE tasks
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
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_TASK_ERROR',
        message: 'Failed to update task'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * PATCH /v1/tasks/:id/complete
 * Mark a task as complete (convenience endpoint)
 */
const completeTask = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `UPDATE tasks
      SET
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND team_id = $2
        AND deleted_at IS NULL
      RETURNING *`,
      [id, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
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
    console.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_TASK_ERROR',
        message: 'Failed to complete task'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * DELETE /v1/tasks/:id
 * Soft delete a task
 */
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `UPDATE tasks
      SET deleted_at = NOW()
      WHERE id = $1
        AND team_id = $2
        AND deleted_at IS NULL
      RETURNING id`,
      [id, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_TASK_ERROR',
        message: 'Failed to delete task'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllTasks,
  getMyTasks,
  getOverdueTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask
};
