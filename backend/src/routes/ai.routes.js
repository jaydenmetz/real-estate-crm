const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');
const aiPermissions = require('../middleware/aiPermissions.middleware');

// All AI routes require authentication and permission
router.use(authenticate);
router.use(aiPermissions);

// List AI agents and their status
router.get('/agents', aiController.getAgents);

// Toggle an agent on or off
router.patch('/agents/:agentId/toggle', aiController.toggleAgent);

// Retrieve token usage statistics
router.get('/token-usage', aiController.getTokenUsage);

// Executive (‘Alex’) endpoints
router.get('/alex/daily-briefing', aiController.getDailyBriefing);
router.get('/alex/urgent-tasks', aiController.getUrgentTasks);

module.exports = router;
