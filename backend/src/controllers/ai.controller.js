const logger = require('../utils/logger');
const AIAgent = require('../models/AIAgent');
const alexService = require('../services/ai/alex.service');
const buyerManager = require('../services/ai/buyerManager.service');
const listingManager = require('../services/ai/listingManager.service');
const operationsManager = require('../services/ai/operationsManager.service');

exports.getAgents = async (req, res) => {
  try {
    const agents = await AIAgent.findAll();
    
    res.json({
      success: true,
      data: agents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching AI agents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch AI agents'
      }
    });
  }
};

exports.toggleAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    
    const agent = await AIAgent.updateStatus(id, enabled);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'AI agent not found'
        }
      });
    }
    
    // Update service status
    const services = {
      'alex_executive': alexService,
      'buyer_manager': buyerManager,
      'listing_manager': listingManager,
      'ops_manager': operationsManager
    };
    
    if (services[id]) {
      services[id].setEnabled(enabled);
    }
    
    res.json({
      success: true,
      data: agent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error toggling AI agent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to toggle AI agent'
      }
    });
  }
};

exports.getTokenUsage = async (req, res) => {
  try {
    const usage = await AIAgent.getTokenUsage();
    
    res.json({
      success: true,
      data: usage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching token usage:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch token usage'
      }
    });
  }
};

exports.getDailyBriefing = async (req, res) => {
  try {
    if (!alexService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_DISABLED',
          message: 'Alex service is currently disabled'
        }
      });
    }
    
    const briefing = await alexService.generateDailyBriefing();
    
    res.json({
      success: true,
      data: { briefing },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating daily briefing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: 'Failed to generate daily briefing'
      }
    });
  }
};

exports.getUrgentTasks = async (req, res) => {
  try {
    const tasks = await alexService.getUrgentTasks();
    
    res.json({
      success: true,
      data: { tasks },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching urgent tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch urgent tasks'
      }
    });
  }
};

exports.processLead = async (req, res) => {
  try {
    const leadData = req.body;
    
    // Route to buyer lead qualifier
    const qualifier = require('../services/ai/agents/buyerLeadQualifier');
    const result = await qualifier.processNewLead(leadData);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: 'Failed to process lead'
      }
    });
  }
};