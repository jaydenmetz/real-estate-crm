const logger = require('../utils/logger');
const AIAgent = require('../models/AIAgent');
const alexService = require('../services/ai/alex.service');
const buyerManager = require('../services/ai/buyerManager.service');
const listingManager = require('../services/ai/listingManager.service');
const operationsManager = require('../services/ai/operationsManager.service');


exports.getAgents = async (req, res) => {
  try {
    const mockAgents = [
      {
        id: 'alex_executive',
        name: 'Alex - Executive Assistant',
        role: 'executive',
        department: 'management',
        enabled: true,
        model: 'claude-3-opus-20240229',
        monthlyBudget: 500,
        currentUsage: 245,
        lastActive: new Date().toISOString()
      },
      {
        id: 'buyer_manager',
        name: 'Buyer Manager',
        role: 'manager', 
        department: 'buyer',
        enabled: true,
        model: 'claude-3-sonnet-20240229',
        monthlyBudget: 150,
        currentUsage: 89,
        lastActive: new Date().toISOString()
      },
      {
        id: 'listing_manager',
        name: 'Listing Manager',
        role: 'manager',
        department: 'listing', 
        enabled: true,
        model: 'claude-3-sonnet-20240229',
        monthlyBudget: 150,
        currentUsage: 112,
        lastActive: new Date().toISOString()
      },
      {
        id: 'ops_manager', 
        name: 'Operations Manager',
        role: 'manager',
        department: 'operations',
        enabled: true,
        model: 'claude-3-sonnet-20240229', 
        monthlyBudget: 150,
        currentUsage: 67,
        lastActive: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        agents: mockAgents,
        total: mockAgents.length
      },
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
    
    const agent = {
      id: id,
      enabled: enabled,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: agent,
      message: `Agent ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling agent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOGGLE_ERROR',
        message: 'Failed to toggle agent status'
      }
    });
  }
};

exports.getTokenUsage = async (req, res) => {
  try {
    const mockUsage = {
      totalTokens: 2450000,
      totalCost: 73.50,
      period: {
        start: new Date(new Date().setDate(1)).toISOString(),
        end: new Date().toISOString()
      },
      byAgent: [
        { agentId: 'alex_executive', tokens: 1200000, cost: 36.00 },
        { agentId: 'buyer_manager', tokens: 450000, cost: 13.50 },
        { agentId: 'listing_manager', tokens: 560000, cost: 16.80 },
        { agentId: 'ops_manager', tokens: 240000, cost: 7.20 }
      ],
      byDepartment: [
        { name: 'management', value: 1200000 },
        { name: 'buyer', value: 450000 },
        { name: 'listing', value: 560000 },
        { name: 'operations', value: 240000 }
      ],
      dailyTrend: Array(30).fill(null).map((_, i) => ({
        date: new Date(new Date().setDate(new Date().getDate() - 29 + i)).toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 100000) + 50000
      }))
    };

    res.json({
      success: true,
      data: mockUsage
    });
  } catch (error) {
    logger.error('Error fetching token usage:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USAGE_ERROR',
        message: 'Failed to fetch token usage'
      }
    });
  }
};

exports.getDailyBriefing = async (req, res) => {
  try {
    const briefing = await alexService.generateDailyBriefing(req.user.id);
    
    res.json({
      success: true,
      data: briefing
    });
  } catch (error) {
    logger.error('Error generating daily briefing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRIEFING_ERROR',
        message: 'Failed to generate daily briefing'
      }
    });
  }
};

exports.getUrgentTasks = async (req, res) => {
  try {
    const tasks = await alexService.getUrgentTasks(req.user.id);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    logger.error('Error fetching urgent tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASKS_ERROR',
        message: 'Failed to fetch urgent tasks'
      }
    });
  }
};

exports.processLead = async (req, res) => {
  try {
    const { leadData } = req.body;
    
    // Process the lead through appropriate AI service
    // This would be implemented based on lead type
    
    res.json({
      success: true,
      data: {
        leadId: leadData.id,
        processed: true,
        assignedTo: 'appropriate_agent'
      }
    });
  } catch (error) {
    logger.error('Error processing lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LEAD_PROCESS_ERROR',
        message: 'Failed to process lead'
      }
    });
  }
};