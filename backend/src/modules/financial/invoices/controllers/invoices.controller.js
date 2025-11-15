const { validationResult } = require('express-validator');
const Invoice = require('../models/Invoice.mock');
const logger = require('../../../utils/logger');

// GET /invoices
exports.getInvoices = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      clientId: req.query.clientId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      overdue: req.query.overdue,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort,
      order: req.query.order,
    };

    const result = await Invoice.findAll(filters);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch invoices',
      },
    });
  }
};

// GET /invoices/:id
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    res.json({
      success: true,
      data: invoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch invoice',
      },
    });
  }
};

// GET /invoices/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Invoice.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching invoice stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch invoice statistics',
      },
    });
  }
};

// POST /invoices
exports.createInvoice = async (req, res) => {
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

    const invoice = await Invoice.create(req.body);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('invoices').emit('invoice:created', invoice);

    res.status(201).json({
      success: true,
      data: invoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create invoice',
      },
    });
  }
};

// PUT /invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.update(req.params.id, req.body);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('invoices').emit('invoice:updated', invoice);

    res.json({
      success: true,
      data: invoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update invoice',
      },
    });
  }
};

// POST /invoices/:id/payment
exports.recordPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment data',
          details: errors.array(),
        },
      });
    }

    const invoice = await Invoice.recordPayment(req.params.id, req.body);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('invoices').emit('invoice:paymentReceived', {
      id: req.params.id,
      payment: req.body,
      invoice,
    });

    res.json({
      success: true,
      data: invoice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PAYMENT_ERROR',
        message: 'Failed to record payment',
      },
    });
  }
};

// POST /invoices/:id/reminder
exports.sendReminder = async (req, res) => {
  try {
    const result = await Invoice.sendReminder(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REMINDER_ERROR',
        message: 'Failed to send reminder',
      },
    });
  }
};

// DELETE /invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const result = await Invoice.delete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('invoices').emit('invoice:deleted', { id: req.params.id });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete invoice',
      },
    });
  }
};

// GET /invoices/:id/download
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    // In a real implementation, this would generate a PDF
    res.json({
      success: true,
      data: {
        message: 'Invoice download endpoint',
        invoiceNumber: invoice.invoiceNumber,
        downloadUrl: `/api/v1/documents/invoice-${invoice.id}.pdf`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOWNLOAD_ERROR',
        message: 'Failed to download invoice',
      },
    });
  }
};
