const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { requireAIPermission } = require('../middleware/aiPermissions.middleware');

// All routes require authentication
router.use(authenticate);

// AI Agent Management
router.get('/agents', requireRole('master', 'executive'), aiController.getAgents);
router.patch('/agents/:id/toggle', requireRole('master', 'executive'), aiController.toggleAgent);

// Token Usage and Analytics
router.get('/token-usage', requireRole('master', 'executive'), aiController.getTokenUsage);

// Alex Executive Assistant Endpoints
router.get('/alex/daily-briefing', requireRole('master', 'executive'), aiController.getDailyBriefing);
router.get('/alex/urgent-tasks', requireRole('master', 'executive'), aiController.getUrgentTasks);

// Lead Processing (for AI agents)
router.post('/process-lead', requireAIPermission('leads', 'create'), aiController.processLead);

module.exports = router;