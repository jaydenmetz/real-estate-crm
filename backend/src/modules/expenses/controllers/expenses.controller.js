const { validationResult } = require('express-validator');
const Expense = require('../models/Expense.mock');
const logger = require('../../../utils/logger');

// GET /expenses
exports.getExpenses = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      taxDeductible: req.query.taxDeductible,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort,
      order: req.query.order,
    };

    const result = await Expense.findAll(filters);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch expenses',
      },
    });
  }
};

// GET /expenses/:id
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found',
        },
      });
    }

    res.json({
      success: true,
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch expense',
      },
    });
  }
};

// GET /expenses/stats
exports.getStats = async (req, res) => {
  try {
    const filters = {
      year: req.query.year || new Date().getFullYear(),
    };

    const stats = await Expense.getStats(filters);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching expense stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch expense statistics',
      },
    });
  }
};

// GET /expenses/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Expense.getCategories();

    res.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching expense categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch expense categories',
      },
    });
  }
};

// POST /expenses
exports.createExpense = async (req, res) => {
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

    const expense = await Expense.create(req.body);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('expenses').emit('expense:created', expense);

    res.status(201).json({
      success: true,
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create expense',
      },
    });
  }
};

// PUT /expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.update(req.params.id, req.body);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found',
        },
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('expenses').emit('expense:updated', expense);

    res.json({
      success: true,
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update expense',
      },
    });
  }
};

// POST /expenses/:id/receipt
exports.uploadReceipt = async (req, res) => {
  try {
    const receiptData = {
      filename: req.body.filename || 'receipt.pdf',
      url: req.body.url || `/api/v1/documents/receipt-${req.params.id}`,
    };

    const expense = await Expense.uploadReceipt(req.params.id, receiptData);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found',
        },
      });
    }

    res.json({
      success: true,
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error uploading receipt:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload receipt',
      },
    });
  }
};

// PATCH /expenses/:id/approve
exports.approveExpense = async (req, res) => {
  try {
    const approvedBy = req.user?.name || 'Admin';
    const expense = await Expense.approve(req.params.id, approvedBy);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found',
        },
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('expenses').emit('expense:approved', expense);

    res.json({
      success: true,
      data: expense,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error approving expense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVE_ERROR',
        message: 'Failed to approve expense',
      },
    });
  }
};

// DELETE /expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const result = await Expense.delete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('expenses').emit('expense:deleted', { id: req.params.id });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete expense',
      },
    });
  }
};

// POST /expenses/report
exports.generateReport = async (req, res) => {
  try {
    const filters = {
      year: req.body.year || new Date().getFullYear(),
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      category: req.body.category,
      taxDeductible: req.body.taxDeductible,
      userId: req.user?.id || 'System',
    };

    const report = await Expense.generateReport(filters);

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error generating expense report:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: 'Failed to generate expense report',
      },
    });
  }
};
