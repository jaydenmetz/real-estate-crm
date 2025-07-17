const Lead = require('../models/Lead.mock');
const Client = require('../models/Client.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getLeads = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      source: req.query.source,
      temperature: req.query.temperature,
      minScore: req.query.minScore,
      maxScore: req.query.maxScore,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort,
      order: req.query.order
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
    
    // Log AI processing (mock)
    logger.info('Lead created, ready for AI processing:', { leadId: lead.id });
    
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

// DELETE /leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const deletedLead = await Lead.delete(req.params.id);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('leads').emit('lead:deleted', { id: req.params.id });
    
    res.json({
      success: true,
      data: deletedLead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete lead'
      }
    });
  }
};

// POST /leads/:id/convert
exports.convertLead = async (req, res) => {
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
    
    // Create client from lead
    const clientData = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      secondaryPhone: lead.secondaryPhone,
      clientType: req.body.clientType || lead.type,
      status: 'Active',
      source: lead.source,
      referredBy: lead.sourceDetails?.referrerName || null,
      preApproved: lead.budget?.isPreApproved || false,
      preApprovalAmount: lead.budget?.preApprovalAmount || null,
      preApprovalLender: lead.budget?.lender || null,
      currentRent: lead.budget?.currentRent || null,
      desiredMoveDate: lead.timeline === 'ASAP' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      preferredCommunication: 'Email',
      notes: `Converted from lead. Original notes: ${lead.notes}`,
      tags: ['Converted Lead', ...lead.tags],
      address: lead.propertyDetails?.address || '',
      city: lead.propertyInterest?.locations?.[0] || '',
      state: 'CA',
      occupation: '',
      annualIncome: lead.budget?.max ? lead.budget.max / 3 : null
    };
    
    const client = await Client.create(clientData);
    
    // Convert lead
    const result = await Lead.convert(req.params.id, clientData);
    
    res.json({
      success: true,
      data: {
        lead: result,
        client: client
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

// POST /leads/:id/activity
exports.logActivity = async (req, res) => {
  try {
    const activity = await Lead.logActivity(req.params.id, req.body);
    
    if (!activity) {
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

// PATCH /leads/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const lead = await Lead.updateStatus(req.params.id, status, note);
    
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
    io.to('leads').emit('lead:statusChanged', { id: req.params.id, status });
    
    res.json({
      success: true,
      data: lead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating lead status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update lead status'
      }
    });
  }
};

// PATCH /leads/:id/score
exports.updateScore = async (req, res) => {
  try {
    const { score, reason } = req.body;
    
    const lead = await Lead.updateScore(req.params.id, score, reason);
    
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
    logger.error('Error updating lead score:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCORE_ERROR',
        message: 'Failed to update lead score'
      }
    });
  }
};

// GET /leads/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Lead.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch lead statistics'
      }
    });
  }
};

// GET /leads/hot
exports.getHotLeads = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const hotLeads = await Lead.getHotLeads(limit);
    
    res.json({
      success: true,
      data: hotLeads,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching hot leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch hot leads'
      }
    });
  }
};