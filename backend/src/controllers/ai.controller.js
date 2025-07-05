

// backend/src/controllers/ai.controller.js

const AIAgent = require('../models/AIAgent');
const analyticsService = require('../services/analytics.service');
const alexService = require('../services/ai/alex.service');

/**
 * GET /v1/ai/agents
 * Retrieve the list of AI agent configurations and statuses.
 */
exports.getAgents = async (req, res, next) => {
  try {
    const agents = await AIAgent.findAll(); // expects array of agents
    res.json({ agents });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /v1/ai/agents/:agentId/toggle
 * Enable or disable a specific AI agent.
 */
exports.toggleAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const { enabled } = req.body;
    const updated = await AIAgent.updateStatus(agentId, enabled); // expects updated agent
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /v1/ai/token-usage
 * Return aggregated AI token usage statistics.
 */
exports.getTokenUsage = async (req, res, next) => {
  try {
    const usage = await analyticsService.getTokenUsage(); 
    // usage shape: { byModel: {...}, totalTokens: number, costEstimate: number, breakdownByAgent: [...] }
    res.json(usage);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /v1/ai/alex/daily-briefing
 * Generate and return the daily briefing from the Alex executive agent.
 */
exports.getDailyBriefing = async (req, res, next) => {
  try {
    const briefing = await alexService.getDailyBriefing();
    res.json({ briefing });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /v1/ai/alex/urgent-tasks
 * Fetch urgent tasks flagged by the Alex executive agent.
 */
exports.getUrgentTasks = async (req, res, next) => {
  try {
    const tasks = await alexService.getUrgentTasks();
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};