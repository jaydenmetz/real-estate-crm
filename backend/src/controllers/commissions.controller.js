const { validationResult } = require('express-validator');
const Commission = require('../models/Commission.mock');
const logger = require('../utils/logger');

// GET /commissions
exports.getCommissions = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      agentId: req.query.agentId,
      side: req.query.side,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort,
      order: req.query.order,
    };

    const result = await Commission.findAll(filters);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching commissions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch commissions',
      },
    });
  }
};

// GET /commissions/:id
exports.getCommission = async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Commission not found',
        },
      });
    }

    res.json({
      success: true,
      data: commission,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching commission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch commission',
      },
    });
  }
};

// GET /commissions/stats
exports.getStats = async (req, res) => {
  try {
    const agentId = req.query.agentId || null;
    const stats = await Commission.getStats(agentId);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching commission stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch commission statistics',
      },
    });
  }
};

// POST /commissions
exports.createCommission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        },
      });
    }

    const commission = await Commission.create(req.body);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('commissions').emit('commission:created', commission);

    res.status(201).json({
      success: true,
      data: commission,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error creating commission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create commission',
      },
    });
  }
};

// PUT /commissions/:id
exports.updateCommission = async (req, res) => {
  try {
    const commission = await Commission.update(req.params.id, req.body);

    if (!commission) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Commission not found',
        },
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('commissions').emit('commission:updated', commission);

    res.json({
      success: true,
      data: commission,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating commission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update commission',
      },
    });
  }
};

// PATCH /commissions/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, paymentDetails } = req.body;

    const commission = await Commission.updateStatus(req.params.id, status, paymentDetails);

    if (!commission) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Commission not found',
        },
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('commissions').emit('commission:statusChanged', {
      id: req.params.id,
      status,
      commission,
    });

    res.json({
      success: true,
      data: commission,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating commission status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update commission status',
      },
    });
  }
};

// DELETE /commissions/:id
exports.deleteCommission = async (req, res) => {
  try {
    const result = await Commission.delete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('commissions').emit('commission:deleted', { id: req.params.id });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting commission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete commission',
      },
    });
  }
};
