/**
 * Leads Controller (Factory-Based)
 *
 * Generated from CRUD controller factory with leads-specific configuration.
 * Replaces 668 lines of duplicate code with standardized factory pattern.
 *
 * Migration: November 2025
 * Factory: /utils/controllers/crud.controller.factory.js
 * Config: /config/entities/leads.entity.config.js
 */

const { createCRUDController } = require('../../../utils/controllers/crud.controller.factory');
const leadsConfig = require('../../../config/entities/leads.entity.config');

// Generate standard CRUD operations from factory
const crudController = createCRUDController(leadsConfig);

// Export standard operations
exports.getLeads = crudController.getAll;
exports.getLead = crudController.getById;
exports.createLead = crudController.create;
exports.updateLead = crudController.update;
exports.archiveLead = crudController.archive;
exports.deleteLead = crudController.delete;
exports.batchDeleteLeads = crudController.batchDelete;

// Custom endpoints used by routes
const { pool } = require('../../../config/database');
const logger = require('../../../utils/logger');

exports.convertToClient = async (req, res) => {
  // Placeholder for converting lead to client
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Convert to client functionality not yet implemented',
    },
  });
};

exports.recordActivity = async (req, res) => {
  // Placeholder for recording activity on lead
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Record activity functionality not yet implemented',
    },
  });
};
