/**
 * Escrows Controllers Index
 *
 * Central export file for all escrow controller methods.
 * This module re-exports all methods from individual controller files,
 * providing a single import point that matches the original monolithic controller structure.
 *
 * Usage in routes:
 *   const escrowsController = require('./modules/escrows/controllers');
 *   router.get('/escrows', escrowsController.getAllEscrows);
 */

const crudController = require('./crud.controller');
const detailsController = require('./sub-resources/details.controller');
const checklistsController = require('./sub-resources/checklists.controller');
const financialsController = require('./sub-resources/financials.controller');
const peopleController = require('./sub-resources/people.controller');
const timelineController = require('./sub-resources/timeline.controller');
const managerController = require('./manager.controller');

// Export all methods (33 total)
module.exports = {
  // CRUD operations (8 methods)
  getAllEscrows: crudController.getAllEscrows,
  getEscrowById: crudController.getEscrowById,
  createEscrow: crudController.createEscrow,
  updateEscrow: crudController.updateEscrow,
  archiveEscrow: crudController.archiveEscrow,
  restoreEscrow: crudController.restoreEscrow,
  deleteEscrow: crudController.deleteEscrow,
  batchDeleteEscrows: crudController.batchDeleteEscrows,

  // Aliases for backward compatibility
  getEscrows: crudController.getAllEscrows,
  getEscrow: crudController.getEscrowById,

  // Details operations (6 methods)
  getEscrowDetails: detailsController.getEscrowDetails,
  updateEscrowDetails: detailsController.updateEscrowDetails,
  getEscrowPropertyDetails: detailsController.getEscrowPropertyDetails,
  updateEscrowPropertyDetails: detailsController.updateEscrowPropertyDetails,
  getEscrowDocuments: detailsController.getEscrowDocuments,
  updateEscrowDocuments: detailsController.updateEscrowDocuments,

  // Checklist operations (8 methods)
  getEscrowChecklists: checklistsController.getEscrowChecklists,
  updateEscrowChecklists: checklistsController.updateEscrowChecklists,
  getEscrowChecklistLoan: checklistsController.getEscrowChecklistLoan,
  updateEscrowChecklistLoan: checklistsController.updateEscrowChecklistLoan,
  getEscrowChecklistHouse: checklistsController.getEscrowChecklistHouse,
  updateEscrowChecklistHouse: checklistsController.updateEscrowChecklistHouse,
  getEscrowChecklistAdmin: checklistsController.getEscrowChecklistAdmin,
  updateEscrowChecklistAdmin: checklistsController.updateEscrowChecklistAdmin,

  // Alias for backward compatibility
  updateChecklist: checklistsController.updateEscrowChecklists,

  // Financial operations (2 methods)
  getEscrowFinancials: financialsController.getEscrowFinancials,
  updateEscrowFinancials: financialsController.updateEscrowFinancials,

  // People operations (2 methods)
  getEscrowPeople: peopleController.getEscrowPeople,
  updateEscrowPeople: peopleController.updateEscrowPeople,

  // Timeline & Notes operations (4 methods)
  getEscrowTimeline: timelineController.getEscrowTimeline,
  updateEscrowTimeline: timelineController.updateEscrowTimeline,
  getEscrowNotes: timelineController.getEscrowNotes,
  addEscrowNote: timelineController.addEscrowNote,

  // Manager dashboard (1 method)
  getManagerDashboard: managerController.getManagerDashboard,
};
