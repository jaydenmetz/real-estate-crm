const Escrow = require('../models/Escrow');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getEscrows = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      closingDateStart: req.query.closingDateStart,
      closingDateEnd: req.query.closingDateEnd,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      order: req.query.order
    };
    
    const result = await Escrow.findAll(filters);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching escrows:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrows'
      }
    });
  }
};

exports.getEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrow'
      }
    });
  }
};

exports.createEscrow = async (req, res) => {
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
    
    const escrowData = {
      ...req.body,
      createdBy: req.user.name
    };
    
    const escrow = await Escrow.create(escrowData);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('escrows').emit('escrow:created', escrow);
    
    res.status(201).json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create escrow'
      }
    });
  }
};

exports.updateEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.update(req.params.id, req.body);
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('escrows').emit('escrow:updated', escrow);
    
    res.json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update escrow'
      }
    });
  }
};

exports.deleteEscrow = async (req, res) => {
  try {
    const reason = req.headers['x-deletion-reason'] || 'No reason provided';
    const deletionRequest = await Escrow.delete(
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
    logger.error('Error requesting escrow deletion:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to request escrow deletion'
      }
    });
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    const { item, value, note } = req.body;
    
    const checklist = await Escrow.updateChecklist(
      req.params.id,
      item,
      value,
      note
    );
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`escrow:${req.params.id}`).emit('checklist:updated', {
      escrowId: req.params.id,
      item,
      value,
      note
    });
    
    res.json({
      success: true,
      data: checklist,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update checklist'
      }
    });
  }
};