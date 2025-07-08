const Client = require('../models/Client');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getClients = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      tag: req.query.tag,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort
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
    const reason = req.headers['x-deletion-reason'] || 'No reason provided';
    const deletionRequest = await Client.delete(
      req.params.id, 
      req.user.name,
      reason
    );
    
    res.json({
      success: true,
      data: {
        deletionRequest,
        approvalUrl: `${process.env.FRONTEND_URL}/approvals/${deletionRequest.id}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error requesting client deletion:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to request client deletion'
      }
    });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { note, type, isPrivate } = req.body;
    
    const noteRecord = await Client.addNote(req.params.id, {
      note,
      type: type || 'general',
      isPrivate: isPrivate || false,
      createdBy: req.user.name
    });
    
    res.json({
      success: true,
      data: noteRecord,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding client note:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTE_ERROR',
        message: 'Failed to add client note'
      }
    });
  }
};

exports.updateTags = async (req, res) => {
  try {
    const { operation, tags } = req.body;
    
    const client = await Client.updateTags(req.params.id, operation, tags);
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating client tags:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to update client tags'
      }
    });
  }
};