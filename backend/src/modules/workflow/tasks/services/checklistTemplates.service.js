/**
 * Checklist Templates Service
 *
 * Business logic for checklist template management:
 * - Create reusable checklist templates
 * - Manage template tasks
 * - Template-based checklist generation
 *
 * Extracted from checklistTemplates.controller.js for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all checklist templates
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} List of templates
 */
exports.getAllTemplates = async (filters, user) => {
  const { entity_type, is_default } = filters;
  const teamId = user.team_id;

  let query = `
    SELECT
      ct.*,
      (
        SELECT COUNT(*)
        FROM checklist_template_tasks ctt
        WHERE ctt.template_id = ct.id AND ctt.deleted_at IS NULL
      ) as task_count
    FROM checklist_templates ct
    WHERE ct.team_id = $1 AND ct.deleted_at IS NULL
  `;
  const params = [teamId];
  let paramCount = 1;

  if (entity_type) {
    paramCount++;
    query += ` AND ct.entity_type = $${paramCount}`;
    params.push(entity_type);
  }

  if (is_default !== undefined) {
    paramCount++;
    query += ` AND ct.is_default = $${paramCount}`;
    params.push(is_default);
  }

  query += ` ORDER BY ct.is_default DESC, ct.name ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get template by ID with tasks
 * @param {string} id - Template ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Template with tasks
 */
exports.getTemplateById = async (id, user) => {
  const teamId = user.team_id;

  const query = `
    SELECT
      ct.*,
      (
        SELECT json_agg(
          json_build_object(
            'id', ctt.id,
            'title', ctt.title,
            'description', ctt.description,
            'priority', ctt.priority,
            'sort_order', ctt.sort_order
          ) ORDER BY ctt.sort_order
        )
        FROM checklist_template_tasks ctt
        WHERE ctt.template_id = ct.id AND ctt.deleted_at IS NULL
      ) as tasks
    FROM checklist_templates ct
    WHERE ct.id = $1 AND ct.team_id = $2 AND ct.deleted_at IS NULL
  `;

  const result = await pool.query(query, [id, teamId]);

  if (result.rows.length === 0) {
    const error = new Error('Checklist template not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Create checklist template
 * @param {Object} data - Template data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created template
 */
exports.createTemplate = async (data, user) => {
  const {
    name,
    description,
    entity_type,
    is_default = false,
    tasks = []
  } = data;

  const teamId = user.team_id;
  const createdBy = user.id;
  const id = uuidv4();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create template
    const templateQuery = `
      INSERT INTO checklist_templates (
        id,
        team_id,
        name,
        description,
        entity_type,
        is_default,
        created_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const templateResult = await client.query(templateQuery, [
      id,
      teamId,
      name,
      description,
      entity_type,
      is_default,
      createdBy
    ]);

    const template = templateResult.rows[0];

    // Create template tasks
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskQuery = `
        INSERT INTO checklist_template_tasks (
          id,
          template_id,
          title,
          description,
          priority,
          sort_order,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `;

      await client.query(taskQuery, [
        uuidv4(),
        id,
        task.title,
        task.description,
        task.priority || 'medium',
        task.sort_order !== undefined ? task.sort_order : i
      ]);
    }

    await client.query('COMMIT');

    // Return template with tasks
    return await exports.getTemplateById(id, user);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update template
 * @param {string} id - Template ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated template
 */
exports.updateTemplate = async (id, data, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getTemplateById(id, user);

  const { name, description, entity_type, is_default } = data;

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

  if (entity_type !== undefined) {
    paramCount++;
    updates.push(`entity_type = $${paramCount}`);
    params.push(entity_type);
  }

  if (is_default !== undefined) {
    paramCount++;
    updates.push(`is_default = $${paramCount}`);
    params.push(is_default);
  }

  if (updates.length === 0) {
    const error = new Error('No fields to update');
    error.code = 'NO_UPDATES';
    throw error;
  }

  updates.push('updated_at = NOW()');

  const query = `
    UPDATE checklist_templates
    SET ${updates.join(', ')}
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Delete template (soft delete, cascades to template tasks)
 * @param {string} id - Template ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Deleted template
 */
exports.deleteTemplate = async (id, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getTemplateById(id, user);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Soft delete all template tasks
    await client.query(`
      UPDATE checklist_template_tasks
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE template_id = $1 AND deleted_at IS NULL
    `, [id]);

    // Soft delete template
    const result = await client.query(`
      UPDATE checklist_templates
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
 * Add task to template
 * @param {string} templateId - Template ID
 * @param {Object} taskData - Task data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created template task
 */
exports.addTemplateTask = async (templateId, taskData, user) => {
  const teamId = user.team_id;

  // Check access to template
  await exports.getTemplateById(templateId, user);

  const { title, description, priority = 'medium', sort_order } = taskData;

  const query = `
    INSERT INTO checklist_template_tasks (
      id,
      template_id,
      title,
      description,
      priority,
      sort_order,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    uuidv4(),
    templateId,
    title,
    description,
    priority,
    sort_order
  ]);

  return result.rows[0];
};

/**
 * Update template task
 * @param {string} taskId - Template task ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated template task
 */
exports.updateTemplateTask = async (taskId, data, user) => {
  const { title, description, priority, sort_order } = data;

  const updates = [];
  const params = [taskId];
  let paramCount = 1;

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

  if (priority !== undefined) {
    paramCount++;
    updates.push(`priority = $${paramCount}`);
    params.push(priority);
  }

  if (sort_order !== undefined) {
    paramCount++;
    updates.push(`sort_order = $${paramCount}`);
    params.push(sort_order);
  }

  if (updates.length === 0) {
    const error = new Error('No fields to update');
    error.code = 'NO_UPDATES';
    throw error;
  }

  updates.push('updated_at = NOW()');

  const query = `
    UPDATE checklist_template_tasks
    SET ${updates.join(', ')}
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    const error = new Error('Template task not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Delete template task (soft delete)
 * @param {string} taskId - Template task ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Deleted template task
 */
exports.deleteTemplateTask = async (taskId, user) => {
  const query = `
    UPDATE checklist_template_tasks
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, [taskId]);

  if (result.rows.length === 0) {
    const error = new Error('Template task not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};
