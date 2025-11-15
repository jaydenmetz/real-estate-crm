/**
 * Projects Controller
 *
 * Manages development roadmap projects (separate from checklists system)
 * This is for tracking CRM development progress only
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /v1/projects
 * List all projects with optional filtering
 */
const getAllProjects = async (req, res) => {
  const { category, status, priority } = req.query;
  const teamId = req.user.team_id;

  try {
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

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECTS_ERROR',
        message: 'Failed to fetch projects'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /v1/projects/:id
 * Get a single project by ID with all tasks
 */
const getProjectById = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    // Get project
    const projectResult = await pool.query(
      `SELECT * FROM projects
      WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL`,
      [id, teamId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const project = projectResult.rows[0];

    // Get all tasks for this project
    const tasksResult = await pool.query(
      `SELECT * FROM tasks
      WHERE project_id = $1 AND deleted_at IS NULL
      ORDER BY position ASC, created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...project,
        tasks: tasksResult.rows
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECT_ERROR',
        message: 'Failed to fetch project'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /v1/projects
 * Create a new project
 */
const createProject = async (req, res) => {
  const { name, category, description, status, priority } = req.body;
  const userId = req.user.id;
  const teamId = req.user.team_id;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Project name is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  try {
    const projectId = uuidv4();

    const result = await pool.query(
      `INSERT INTO projects (
        id,
        name,
        category,
        description,
        status,
        priority,
        progress_percentage,
        owner_id,
        team_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        projectId,
        name,
        category || null,
        description || null,
        status || 'not-started',
        priority || 'medium',
        0,
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
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PROJECT_ERROR',
        message: 'Failed to create project'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * PUT /v1/projects/:id
 * Update a project
 */
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, status, priority, progress_percentage } = req.body;
  const teamId = req.user.team_id;

  try {
    // Check if project exists
    const checkResult = await pool.query(
      `SELECT team_id FROM projects
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (checkResult.rows[0].team_id !== teamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this project'
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

    if (category !== undefined) {
      params.push(category);
      updates.push(`category = $${paramCount++}`);
    }

    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${paramCount++}`);
    }

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);
    }

    if (priority !== undefined) {
      params.push(priority);
      updates.push(`priority = $${paramCount++}`);
    }

    if (progress_percentage !== undefined) {
      params.push(progress_percentage);
      updates.push(`progress_percentage = $${paramCount++}`);
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
      UPDATE projects
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
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROJECT_ERROR',
        message: 'Failed to update project'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * DELETE /v1/projects/:id
 * Soft delete a project
 */
const deleteProject = async (req, res) => {
  const { id } = req.params;
  const teamId = req.user.team_id;

  try {
    const result = await pool.query(
      `UPDATE projects
      SET deleted_at = NOW()
      WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
      RETURNING id`,
      [id, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { message: 'Project deleted successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PROJECT_ERROR',
        message: 'Failed to delete project'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
