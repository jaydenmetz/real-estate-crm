/**
 * Tasks Routes
 */

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../../../../middleware/apiKey.middleware');

// All routes require authentication
router.use(authenticate);

// GET /v1/tasks - List all tasks with filtering
router.get('/', tasksController.getAllTasks);

// GET /v1/tasks/my-tasks - Get current user's tasks
router.get('/my-tasks', tasksController.getMyTasks);

// GET /v1/tasks/overdue - Get overdue tasks
router.get('/overdue', tasksController.getOverdueTasks);

// GET /v1/tasks/:id - Get task by ID
router.get('/:id', tasksController.getTaskById);

// POST /v1/tasks - Create new task
router.post('/', tasksController.createTask);

// PUT /v1/tasks/:id - Update task
router.put('/:id', tasksController.updateTask);

// PATCH /v1/tasks/:id/complete - Mark task as complete
router.patch('/:id/complete', tasksController.completeTask);

// DELETE /v1/tasks/:id - Delete task
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
