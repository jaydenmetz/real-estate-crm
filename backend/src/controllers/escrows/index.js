/**
 * Escrows Controller - Modular Index
 * Exports all escrow-related controllers for backward compatibility
 *
 * This file replaces the monolithic escrows.controller.js (2,792 lines)
 * with a modular folder structure for better organization and maintainability.
 *
 * Structure:
 *  - shared.js: Common utilities (schema detection, fetchEscrowById)
 *  - people.controller.js: GET/PUT /v1/escrows/:id/people
 *  - timeline.controller.js: GET/PUT /v1/escrows/:id/timeline
 *  - financials.controller.js: GET/PUT /v1/escrows/:id/financials
 *  - checklists.controller.js: GET/PUT /v1/escrows/:id/checklists (all 3 types)
 *  - documents.controller.js: GET/PUT/POST/DELETE /v1/escrows/:id/documents
 *
 * The original escrows.controller.js is kept temporarily for reference
 * and will be deleted once Phase 1 is complete and tested.
 */

const PeopleController = require('./people.controller');
const TimelineController = require('./timeline.controller');
const FinancialsController = require('./financials.controller');
const ChecklistsController = require('./checklists.controller');
const DocumentsController = require('./documents.controller');

// Import the original controller for methods we haven't modularized yet
const OriginalController = require('../escrows.controller');

/**
 * Modular exports for escrows routes
 *
 * Phase 1 Focus: Widget-specific endpoints
 * - People (completed)
 * - Timeline (completed)
 * - Financials (completed)
 * - Checklists (completed)
 * - Documents (completed)
 *
 * Still using original controller for:
 * - getAllEscrows
 * - getEscrowById
 * - createEscrow
 * - updateEscrow
 * - archiveEscrow
 * - restoreEscrow
 * - deleteEscrow
 * - batchDeleteEscrows
 * - getEscrowStats
 * - getEscrowDetails
 * - getEscrowPropertyDetails
 * - updateEscrowDetails
 * - updateEscrowPropertyDetails
 * - getEscrowNotes
 * - addEscrowNote
 */
module.exports = {
  // ==========================================
  // MODULARIZED WIDGET ENDPOINTS (Phase 1)
  // ==========================================

  // People endpoints
  getEscrowPeople: PeopleController.getEscrowPeople,
  updateEscrowPeople: PeopleController.updateEscrowPeople,

  // Timeline endpoints
  getEscrowTimeline: TimelineController.getEscrowTimeline,
  updateEscrowTimeline: TimelineController.updateEscrowTimeline,

  // Financials endpoints
  getEscrowFinancials: FinancialsController.getEscrowFinancials,
  updateEscrowFinancials: FinancialsController.updateEscrowFinancials,

  // Checklists endpoints (all 3 types)
  getEscrowChecklists: ChecklistsController.getEscrowChecklists,
  getEscrowChecklistLoan: ChecklistsController.getEscrowChecklistLoan,
  getEscrowChecklistHouse: ChecklistsController.getEscrowChecklistHouse,
  getEscrowChecklistAdmin: ChecklistsController.getEscrowChecklistAdmin,
  updateEscrowChecklists: ChecklistsController.updateEscrowChecklists,
  updateEscrowChecklistLoan: ChecklistsController.updateEscrowChecklistLoan,
  updateEscrowChecklistHouse: ChecklistsController.updateEscrowChecklistHouse,
  updateEscrowChecklistAdmin: ChecklistsController.updateEscrowChecklistAdmin,
  updateChecklist: ChecklistsController.updateChecklist,

  // Documents endpoints
  getEscrowDocuments: DocumentsController.getEscrowDocuments,
  updateEscrowDocuments: DocumentsController.updateEscrowDocuments,
  addEscrowDocument: DocumentsController.addEscrowDocument,
  deleteEscrowDocument: DocumentsController.deleteEscrowDocument,

  // ==========================================
  // ORIGINAL CONTROLLER METHODS (Unchanged)
  // ==========================================

  // Core CRUD operations
  getAllEscrows: OriginalController.getAllEscrows,
  getEscrowById: OriginalController.getEscrowById,
  createEscrow: OriginalController.createEscrow,
  updateEscrow: OriginalController.updateEscrow,
  archiveEscrow: OriginalController.archiveEscrow,
  restoreEscrow: OriginalController.restoreEscrow,
  deleteEscrow: OriginalController.deleteEscrow,
  batchDeleteEscrows: OriginalController.batchDeleteEscrows,

  // Aliased methods (for backward compatibility with routes)
  getEscrows: OriginalController.getAllEscrows,
  getEscrow: OriginalController.getEscrowById,

  // Stats and details
  getEscrowStats: OriginalController.getEscrowStats,
  getEscrowDetails: OriginalController.getEscrowDetails,
  updateEscrowDetails: OriginalController.updateEscrowDetails,

  // Property details
  getEscrowPropertyDetails: OriginalController.getEscrowPropertyDetails,
  updateEscrowPropertyDetails: OriginalController.updateEscrowPropertyDetails,

  // Notes
  getEscrowNotes: OriginalController.getEscrowNotes,
  addEscrowNote: OriginalController.addEscrowNote,

  // Image
  getEscrowImage: OriginalController.getEscrowImage,
};
