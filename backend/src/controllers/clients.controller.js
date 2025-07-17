const Client = require('../models/Client.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getClients = async (req, res) => {
  try {
    const filters = {
      clientType: req.query.type || req.query.clientType,
      status: req.query.status,
      source: req.query.source,
      tag: req.query.tag,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort,
      order: req.query.order
    };
    
    const result = await Client.findAll(filters);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch clients'
      }
    });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch client'
      }
    });
  }
};

exports.createClient = async (req, res) => {
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
    
    const client = await Client.create(req.body);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:created', client);
    
    res.status(201).json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create client'
      }
    });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.update(req.params.id, req.body);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:updated', client);
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update client'
      }
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.delete(req.params.id);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:deleted', { id: req.params.id });
    
    res.json({
      success: true,
      data: deletedClient,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete client'
      }
    });
  }
};

// POST /clients/:id/communication
exports.logCommunication = async (req, res) => {
  try {
    const communication = await Client.logCommunication(req.params.id, req.body);
    
    if (!communication) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: communication,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error logging communication:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMUNICATION_ERROR',
        message: 'Failed to log communication'
      }
    });
  }
};

// PATCH /clients/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const client = await Client.updateStatus(req.params.id, status, note);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:statusChanged', { id: req.params.id, status });
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating client status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update client status'
      }
    });
  }
};

// POST /clients/:id/tags
exports.addTag = async (req, res) => {
  try {
    const { tag } = req.body;
    
    const client = await Client.addTag(req.params.id, tag);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding tag:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to add tag'
      }
    });
  }
};

// DELETE /clients/:id/tags/:tag
exports.removeTag = async (req, res) => {
  try {
    const client = await Client.removeTag(req.params.id, req.params.tag);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error removing tag:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to remove tag'
      }
    });
  }
};

// GET /clients/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Client.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch client statistics'
      }
    });
  }
};