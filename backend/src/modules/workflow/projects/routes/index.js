/**
 * Projects Routes
 * For development roadmap tracking (admin-only)
 */

const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { authenticate } = require('../../../../middleware/apiKey.middleware');

// All routes require authentication
router.use(authenticate);

// GET /v1/projects - List all projects
router.get('/', projectsController.getAllProjects);

// GET /v1/projects/:id - Get project by ID (with tasks)
router.get('/:id', projectsController.getProjectById);

// POST /v1/projects - Create new project
router.post('/', projectsController.createProject);

// PUT /v1/projects/:id - Update project
router.put('/:id', projectsController.updateProject);

// DELETE /v1/projects/:id - Delete project
router.delete('/:id', projectsController.deleteProject);

module.exports = router;
