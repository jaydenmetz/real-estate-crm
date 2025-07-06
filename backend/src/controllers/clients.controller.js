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

const Listing = require('../models/Listing');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getListings = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      propertyType: req.query.propertyType,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort
    };
    
    const result = await Listing.findAll(filters);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listings'
      }
    });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listing'
      }
    });
  }
};

exports.createListing = async (req, res) => {
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
    
    const listing = await Listing.create(req.body);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('listings').emit('listing:created', listing);
    
    res.status(201).json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create listing'
      }
    });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.update(req.params.id, req.body);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('listings').emit('listing:updated', listing);
    
    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update listing'
      }
    });
  }
};

exports.priceReduction = async (req, res) => {
  try {
    const { newPrice, reason, effectiveDate } = req.body;
    
    const result = await Listing.recordPriceReduction(req.params.id, {
      newPrice,
      reason,
      effectiveDate: effectiveDate || new Date()
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error recording price reduction:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRICE_ERROR',
        message: 'Failed to record price reduction'
      }
    });
  }
};

exports.logShowing = async (req, res) => {
  try {
    const { date, time, agent, feedback, interested } = req.body;
    
    const showing = await Listing.logShowing(req.params.id, {
      date,
      time,
      agent,
      feedback,
      interested
    });
    
    res.json({
      success: true,
      data: showing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error logging showing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHOWING_ERROR',
        message: 'Failed to log showing'
      }
    });
  }
};