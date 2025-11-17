/**
 * Projects Service
 *
 * Business logic for project management:
 * - CRM development roadmap tracking
 * - Project lifecycle management
 * - Task association and progress tracking
 *
 * Extracted from projects.controller.js for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all projects with filtering and task counts
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} List of projects
 */
exports.getAllProjects = async (filters, user) => {
  const { category, status, priority } = filters;
  const teamId = user.team_id;

  let query = `
    SELECT
      p.*,
      (
        SELECT COUNT(*)
        FROM tasks
        WHERE project_id = p.id AND deleted_at IS NULL
      ) as total_tasks,
      (
        SELECT COUNT(*)
        FROM tasks
        WHERE project_id = p.id AND status = 'completed' AND deleted_at IS NULL
      ) as completed_tasks
    FROM projects p
    WHERE p.deleted_at IS NULL
      AND p.team_id = $1
  `;
  const params = [teamId];
  let paramCount = 1;

  if (category) {
    paramCount++;
    query += ` AND p.category = $${paramCount}`;
    params.push(category);
  }

  if (status) {
    paramCount++;
    query += ` AND p.status = $${paramCount}`;
    params.push(status);
  }

  if (priority) {
    paramCount++;
    query += ` AND p.priority = $${paramCount}`;
    params.push(priority);
  }

  query += ` ORDER BY
    CASE p.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
      ELSE 5
    END,
    p.created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows.map(project => ({
    ...project,
    completion_percentage: project.total_tasks > 0
      ? Math.round((project.completed_tasks / project.total_tasks) * 100)
      : 0
  }));
};

/**
 * Get project by ID with tasks
 * @param {string} id - Project ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Project details
 */
exports.getProjectById = async (id, user) => {
  const teamId = user.team_id;

  const query = `
    SELECT
      p.*,
      (
        SELECT json_agg(
          json_build_object(
            'id', t.id,
            'title', t.title,
            'status', t.status,
            'priority', t.priority,
            'due_date', t.due_date,
            'assigned_to', t.assigned_to
          ) ORDER BY t.created_at
        )
        FROM tasks t
        WHERE t.project_id = p.id AND t.deleted_at IS NULL
      ) as tasks
    FROM projects p
    WHERE p.id = $1 AND p.team_id = $2 AND p.deleted_at IS NULL
  `;

  const result = await pool.query(query, [id, teamId]);

  if (result.rows.length === 0) {
    const error = new Error('Project not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Create project
 * @param {Object} data - Project data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created project
 */
exports.createProject = async (data, user) => {
  const {
    name,
    description,
    category,
    status = 'planning',
    priority = 'medium',
    start_date,
    target_date,
    metadata
  } = data;

  const teamId = user.team_id;
  const createdBy = user.id;
  const id = uuidv4();

  const query = `
    INSERT INTO projects (
      id,
      team_id,
      name,
      description,
      category,
      status,
      priority,
      start_date,
      target_date,
      created_by,
      metadata,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    id,
    teamId,
    name,
    description,
    category,
    status,
    priority,
    start_date,
    target_date,
    createdBy,
    metadata ? JSON.stringify(metadata) : null
  ]);

  return result.rows[0];
};

/**
 * Update project
 * @param {string} id - Project ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated project
 */
exports.updateProject = async (id, data, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getProjectById(id, user);

  const {
    name,
    description,
    category,
    status,
    priority,
    start_date,
    target_date,
    metadata
  } = data;

  const updates = [];
  const params = [id, teamId];
  let paramCount = 2;

  if (name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(name);
  }

  if (description !== undefined) {
    paramCount++;
    updates.push(`description = $${paramCount}`);
    params.push(description);
  }

  if (category !== undefined) {
    paramCount++;
    updates.push(`category = $${paramCount}`);
    params.push(category);
  }

  if (status !== undefined) {
    paramCount++;
    updates.push(`status = $${paramCount}`);
    params.push(status);
  }

  if (priority !== undefined) {
    paramCount++;
    updates.push(`priority = $${paramCount}`);
    params.push(priority);
  }

  if (start_date !== undefined) {
    paramCount++;
    updates.push(`start_date = $${paramCount}`);
    params.push(start_date);
  }

  if (target_date !== undefined) {
    paramCount++;
    updates.push(`target_date = $${paramCount}`);
    params.push(target_date);
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
    UPDATE projects
    SET ${updates.join(', ')}
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Delete project (soft delete)
 * @param {string} id - Project ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Deleted project
 */
exports.deleteProject = async (id, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getProjectById(id, user);

  const query = `
    UPDATE projects
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, [id, teamId]);
  return result.rows[0];
};
