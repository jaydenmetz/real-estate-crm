/**
 * Leads Controllers Index
 *
 * Aggregates all leads controller functions from modular files.
 *
 * Organization:
 * - crud.controller.js: CRUD operations (7 methods)
 * - conversion.controller.js: Conversion & activity operations (2 methods)
 *
 * @module controllers/leads
 */

const crudController = require('./crud.controller');
const conversionController = require('./sub-resources/conversion.controller');

module.exports = {
  // CRUD operations (7 methods)
  getLeads: crudController.getLeads,
  getLead: crudController.getLead,
  createLead: crudController.createLead,
  updateLead: crudController.updateLead,
  archiveLead: crudController.archiveLead,
  deleteLead: crudController.deleteLead,
  batchDeleteLeads: crudController.batchDeleteLeads,

  // Conversion & Activity operations (2 methods)
  convertToClient: conversionController.convertToClient,
  recordActivity: conversionController.recordActivity,
};
