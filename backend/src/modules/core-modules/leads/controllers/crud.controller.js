/**
 * Leads CRUD Controller
 *
 * HTTP layer for leads operations - delegates business logic to service layer.
 * Handles request/response and error mapping only.
 *
 * @module controllers/leads/crud
 */

const leadsService = require('../services/leads.service');
const logger = require('../../../../utils/logger');

// GET /api/v1/leads
exports.getLeads = async (req, res) => {
  try {
    const result = await leadsService.getAllLeads(req.query, req.user);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch leads',
        details: error.message,
      },
    });
  }
};

// GET /api/v1/leads/:id
exports.getLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await leadsService.getLeadById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    res.json({
      success: true,
      data: lead,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch lead',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/leads
exports.createLead = async (req, res) => {
  try {
    const newLead = await leadsService.createLead(req.body, req.user);

    res.status(201).json({
      success: true,
      data: newLead,
      message: 'Lead created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'MISSING_FIELDS') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: error.message,
        },
      });
    }

    logger.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create lead',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLead = await leadsService.updateLead(id, req.body, req.user);

    res.json({
      success: true,
      data: updatedLead,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NO_UPDATES') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: error.message,
        },
      });
    }

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.code === 'VERSION_CONFLICT') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: error.message,
          currentVersion: error.currentVersion,
          attemptedVersion: error.attemptedVersion,
        },
      });
    }

    logger.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update lead',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/leads/:id/archive
exports.archiveLead = async (req, res) => {
  try {
    const { id } = req.params;
    const archivedLead = await leadsService.archiveLead(id);

    res.json({
      success: true,
      data: archivedLead,
      message: 'Lead archived successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    logger.error('Error archiving lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive lead',
        details: error.message,
      },
    });
  }
};

// DELETE /api/v1/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    await leadsService.deleteLead(id, req.user);

    res.json({
      success: true,
      message: 'Lead deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.code === 'NOT_ARCHIVED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: error.message,
        },
      });
    }

    logger.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete lead',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/leads/batch-delete
exports.batchDeleteLeads = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await leadsService.batchDeleteLeads(ids, req.user);

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} leads`,
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds,
    });
  } catch (error) {
    if (error.code === 'NOT_ARCHIVED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: error.message,
        },
      });
    }

    logger.error('Error batch deleting leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to batch delete leads',
        details: error.message,
      },
    });
  }
};
