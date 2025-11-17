/**
 * Checklists Service
 *
 * Business logic for checklist management:
 * - Create checklists from templates
 * - Manage checklist lifecycle
 * - Track completion progress
 *
 * Extracted from checklists.controller.js for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');
const tasksService = require('./tasks.service');

/**
 * Get all checklists with filtering
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} List of checklists
 */
exports.getAllChecklists = async (filters, user) => {
  const { entity_type, entity_id, status } = filters;
  const teamId = user.team_id;

  let query = `
    SELECT
      c.*,
      ct.name as template_name,
      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.checklist_id = c.id AND t.deleted_at IS NULL
      ) as total_tasks,
      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.checklist_id = c.id
          AND t.status = 'completed'
          AND t.deleted_at IS NULL
      ) as completed_tasks
    FROM checklists c
    LEFT JOIN checklist_templates ct ON c.template_id = ct.id
    WHERE c.team_id = $1 AND c.deleted_at IS NULL
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

  // Calculate completion percentage
  return result.rows.map(checklist => ({
    ...checklist,
    completion_percentage: checklist.total_tasks > 0
      ? Math.round((checklist.completed_tasks / checklist.total_tasks) * 100)
      : 0
  }));
};

/**
 * Get checklist by ID
 * @param {string} id - Checklist ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Checklist with tasks
 */
exports.getChecklistById = async (id, user) => {
  const teamId = user.team_id;

  const query = `
    SELECT
      c.*,
      ct.name as template_name,
      (
        SELECT json_agg(
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'status', t.status,
            'priority', t.priority,
            'due_date', t.due_date,
            'assigned_to', t.assigned_to,
            'completed_at', t.completed_at
          ) ORDER BY t.created_at
        )
        FROM tasks t
        WHERE t.checklist_id = c.id AND t.deleted_at IS NULL
      ) as tasks
    FROM checklists c
    LEFT JOIN checklist_templates ct ON c.template_id = ct.id
    WHERE c.id = $1 AND c.team_id = $2 AND c.deleted_at IS NULL
  `;

  const result = await pool.query(query, [id, teamId]);

  if (result.rows.length === 0) {
    const error = new Error('Checklist not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Create checklist from template
 * @param {Object} data - Checklist data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created checklist with tasks
 */
exports.createChecklist = async (data, user) => {
  const {
    template_id,
    name,
    entity_type,
    entity_id,
    metadata
  } = data;

  const teamId = user.team_id;
  const createdBy = user.id;
  const id = uuidv4();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create checklist
    const checklistQuery = `
      INSERT INTO checklists (
        id,
        team_id,
        template_id,
        name,
        entity_type,
        entity_id,
        status,
        created_by,
        metadata,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const checklistResult = await client.query(checklistQuery, [
      id,
      teamId,
      template_id,
      name,
      entity_type,
      entity_id,
      createdBy,
      metadata ? JSON.stringify(metadata) : null
    ]);

    const checklist = checklistResult.rows[0];

    // If template provided, create tasks from template
    if (template_id) {
      const templateTasksQuery = `
        SELECT * FROM checklist_template_tasks
        WHERE template_id = $1 AND deleted_at IS NULL
        ORDER BY sort_order
      `;

      const templateTasks = await client.query(templateTasksQuery, [template_id]);

      // Create tasks from template
      for (const templateTask of templateTasks.rows) {
        const taskQuery = `
          INSERT INTO tasks (
            id,
            team_id,
            checklist_id,
            title,
            description,
            status,
            priority,
            due_date,
            created_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        `;

        await client.query(taskQuery, [
          uuidv4(),
          teamId,
          id,
          templateTask.title,
          templateTask.description,
          'pending',
          templateTask.priority || 'medium',
          null, // due_date can be set later
          createdBy
        ]);
      }
    }

    await client.query('COMMIT');

    // Return checklist with tasks
    return await exports.getChecklistById(id, user);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update checklist
 * @param {string} id - Checklist ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated checklist
 */
exports.updateChecklist = async (id, data, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getChecklistById(id, user);

  const { name, status, metadata } = data;

  const updates = [];
  const params = [id, teamId];
  let paramCount = 2;

  if (name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(name);
  }

  if (status !== undefined) {
    paramCount++;
    updates.push(`status = $${paramCount}`);
    params.push(status);
  }

  if (metadata !== undefined) {
    paramCount++;
    updates.push(`metadata = $${paramCount}`);
    params.push(metadata ? JSON.stringify(metadata) : null);
  }

  if (updates.length === 0) {
    const error = new Error('No fields to update');
    error.code = 'NO_UPDATES';
    throw error;
  }

  updates.push('updated_at = NOW()');

  const query = `
    UPDATE checklists
    SET ${updates.join(', ')}
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Delete checklist (soft delete, cascades to tasks)
 * @param {string} id - Checklist ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Deleted checklist
 */
exports.deleteChecklist = async (id, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getChecklistById(id, user);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Soft delete all tasks
    await client.query(`
      UPDATE tasks
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE checklist_id = $1 AND team_id = $2 AND deleted_at IS NULL
    `, [id, teamId]);

    // Soft delete checklist
    const result = await client.query(`
      UPDATE checklists
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
      RETURNING *
    `, [id, teamId]);

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Calculate checklist completion status
 * @param {string} id - Checklist ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Completion stats
 */
exports.getChecklistCompletionStats = async (id, user) => {
  const teamId = user.team_id;

  const query = `
    SELECT
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
      COUNT(*) FILTER (WHERE priority = 'critical') as critical_tasks,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue_tasks
    FROM tasks
    WHERE checklist_id = $1
      AND team_id = $2
      AND deleted_at IS NULL
  `;

  const result = await pool.query(query, [id, teamId]);
  const stats = result.rows[0];

  return {
    ...stats,
    total_tasks: parseInt(stats.total_tasks),
    completed_tasks: parseInt(stats.completed_tasks),
    in_progress_tasks: parseInt(stats.in_progress_tasks),
    pending_tasks: parseInt(stats.pending_tasks),
    critical_tasks: parseInt(stats.critical_tasks),
    overdue_tasks: parseInt(stats.overdue_tasks),
    completion_percentage: stats.total_tasks > 0
      ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
      : 0
  };
};
