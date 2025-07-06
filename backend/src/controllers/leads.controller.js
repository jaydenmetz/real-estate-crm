const Lead = require('../models/Lead');
const Client = require('../models/Client');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const buyerLeadQualifier = require('../services/ai/agents/buyerLeadQualifier');

exports.getLeads = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      source: req.query.source,
      temperature: req.query.temperature,
      assignedAgent: req.query.assignedAgent,
      dateRange: req.query.dateRange,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort
    };
    
    const result = await Lead.findAll(filters);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch leads'
      }
    });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: lead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch lead'
      }
    });
  }
};

exports.createLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    
    const lead = await Lead.create(req.body);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('leads').emit('lead:created', lead);
    
    // Auto-process with AI if enabled
    if (buyerLeadQualifier.isEnabled()) {
      buyerLeadQualifier.processNewLead(lead);
    }
    
    res.status(201).json({
      success: true,
      data: lead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create lead'
      }
    });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.update(req.params.id, req.body);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('leads').emit('lead:updated', lead);
    
    res.json({
      success: true,
      data: lead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update lead'
      }
    });
  }
};

exports.convertLead = async (req, res) => {
  try {
    const { clientType, notes } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Create client from lead
    const clientData = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      clientType: clientType,
      leadSource: lead.leadSource,
      tags: ['converted-lead']
    };
    
    const client = await Client.create(clientData);
    
    // Update lead status
    await Lead.update(req.params.id, {
      convertedToClient: true,
      conversionDate: new Date(),
      leadStatus: 'Converted'
    });
    
    res.json({
      success: true,
      data: {
        client,
        conversionNotes: notes
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert lead'
      }
    });
  }
};

exports.logActivity = async (req, res) => {
  try {
    const { type, duration, notes, outcome, nextFollowUp } = req.body;
    
    const activity = await Lead.logActivity(req.params.id, {
      type,
      duration,
      notes,
      outcome,
      nextFollowUp
    });
    
    res.json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error logging lead activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOG_ERROR',
        message: 'Failed to log lead activity'
      }
    });
  }
};