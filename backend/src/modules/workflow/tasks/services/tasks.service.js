/**
 * Tasks Service
 *
 * Business logic for task management:
 * - Standalone tasks (project-based)
 * - Checklist tasks (checklist-based)
 * - Entity-related tasks (escrows, listings, clients)
 *
 * Extracted from tasks.controller.js for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all tasks with filtering
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} List of tasks
 */
exports.getAllTasks = async (filters, user) => {
  const {
    project_id,
    checklist_id,
    status,
    priority,
    assigned_to,
    related_entity_type,
    related_entity_id
  } = filters;
  const teamId = user.team_id;

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
  return result.rows;
};

/**
 * Get task by ID
 * @param {string} id - Task ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Task details
 */
exports.getTaskById = async (id, user) => {
  const teamId = user.team_id;

  const query = `
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
    WHERE t.id = $1
      AND t.team_id = $2
      AND t.deleted_at IS NULL
  `;

  const result = await pool.query(query, [id, teamId]);

  if (result.rows.length === 0) {
    const error = new Error('Task not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Create a new task
 * @param {Object} data - Task data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created task
 */
exports.createTask = async (data, user) => {
  const {
    title,
    description,
    status = 'pending',
    priority = 'medium',
    due_date,
    assigned_to,
    project_id,
    checklist_id,
    related_entity_type,
    related_entity_id,
    metadata
  } = data;

  const teamId = user.team_id;
  const createdBy = user.id;
  const id = uuidv4();

  const query = `
    INSERT INTO tasks (
      id,
      team_id,
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
      created_by,
      project_id,
      checklist_id,
      related_entity_type,
      related_entity_id,
      metadata,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    id,
    teamId,
    title,
    description,
    status,
    priority,
    due_date,
    assigned_to,
    createdBy,
    project_id,
    checklist_id,
    related_entity_type,
    related_entity_id,
    metadata ? JSON.stringify(metadata) : null
  ]);

  return result.rows[0];
};

/**
 * Update task
 * @param {string} id - Task ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated task
 */
exports.updateTask = async (id, data, user) => {
  const teamId = user.team_id;

  // First check if task exists and user has access
  await exports.getTaskById(id, user);

  const {
    title,
    description,
    status,
    priority,
    due_date,
    assigned_to,
    completed_at,
    metadata
  } = data;

  const updates = [];
  const params = [id, teamId];
  let paramCount = 2;

  if (title !== undefined) {
    paramCount++;
    updates.push(`title = $${paramCount}`);
    params.push(title);
  }

  if (description !== undefined) {
    paramCount++;
    updates.push(`description = $${paramCount}`);
    params.push(description);
  }

  if (status !== undefined) {
    paramCount++;
    updates.push(`status = $${paramCount}`);
    params.push(status);

    // Auto-set completed_at when status changes to completed
    if (status === 'completed' && !completed_at) {
      paramCount++;
      updates.push(`completed_at = NOW()`);
    }
  }

  if (priority !== undefined) {
    paramCount++;
    updates.push(`priority = $${paramCount}`);
    params.push(priority);
  }

  if (due_date !== undefined) {
    paramCount++;
    updates.push(`due_date = $${paramCount}`);
    params.push(due_date);
  }

  if (assigned_to !== undefined) {
    paramCount++;
    updates.push(`assigned_to = $${paramCount}`);
    params.push(assigned_to);
  }

  if (completed_at !== undefined) {
    paramCount++;
    updates.push(`completed_at = $${paramCount}`);
    params.push(completed_at);
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
    UPDATE tasks
    SET ${updates.join(', ')}
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Delete task (soft delete)
 * @param {string} id - Task ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Deleted task
 */
exports.deleteTask = async (id, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getTaskById(id, user);

  const query = `
    UPDATE tasks
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, [id, teamId]);
  return result.rows[0];
};

/**
 * Bulk update task statuses (for checklist completion)
 * @param {Array<string>} taskIds - Array of task IDs
 * @param {string} status - New status
 * @param {Object} user - Authenticated user
 * @returns {Promise<number>} Number of tasks updated
 */
exports.bulkUpdateStatus = async (taskIds, status, user) => {
  const teamId = user.team_id;

  const query = `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = ANY($2::uuid[])
      AND team_id = $3
      AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [status, taskIds, teamId]);
  return result.rowCount;
};
