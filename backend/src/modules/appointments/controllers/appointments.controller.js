/**
 * Appointments Controller (Factory-Based)
 *
 * Generated from CRUD controller factory with appointments-specific configuration.
 * Replaces 625 lines of duplicate code with standardized factory pattern.
 *
 * Migration: November 2025
 * Factory: /utils/controllers/crud.controller.factory.js
 * Config: /config/entities/appointments.entity.config.js
 */

const { createCRUDController } = require('../../../utils/controllers/crud.controller.factory');
const appointmentsConfig = require('../../../config/entities/appointments.entity.config');

// Generate standard CRUD operations from factory
const crudController = createCRUDController(appointmentsConfig);

// Export standard operations
exports.getAppointments = crudController.getAll;
exports.getAppointment = crudController.getById;
exports.createAppointment = crudController.create;
exports.updateAppointment = crudController.update;
exports.archiveAppointment = crudController.archive;
exports.deleteAppointment = crudController.delete;
exports.batchDeleteAppointments = crudController.batchDelete;

// Custom endpoints used by routes
const { pool } = require('../../../config/database');
const logger = require('../../../utils/logger');

exports.cancelAppointment = async (req, res) => {
  // Placeholder for canceling appointment
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Cancel appointment functionality not yet implemented',
    },
  });
};

exports.markComplete = async (req, res) => {
  // Placeholder for marking appointment complete
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Mark complete functionality not yet implemented',
    },
  });
};
