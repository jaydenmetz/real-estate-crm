/**
 * Clients Controller (Factory-Based)
 *
 * Generated from CRUD controller factory with clients-specific configuration.
 * Replaces 861 lines of duplicate code with standardized factory pattern.
 *
 * Migration: November 2025
 * Factory: /utils/controllers/crud.controller.factory.js
 * Config: /config/entities/clients.entity.config.js
 */

const { createCRUDController } = require('../../../utils/controllers/crud.controller.factory');
const clientsConfig = require('../../../config/entities/clients.entity.config');

// Generate standard CRUD operations from factory
const crudController = createCRUDController(clientsConfig);

// Export standard operations
exports.getAllClients = crudController.getAll;
exports.getClient = crudController.getById;
exports.createClient = crudController.create;
exports.updateClient = crudController.update;
exports.archiveClient = crudController.archive;
exports.deleteClient = crudController.delete;
exports.batchDeleteClients = crudController.batchDelete;

// Custom endpoints can be added here if needed
