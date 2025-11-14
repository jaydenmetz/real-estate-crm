/**
 * Clients Controllers Index
 *
 * Central export point for all client controller functions.
 * Aggregates CRUD operations and notes/tags operations from separate modules.
 *
 * This modular structure allows for:
 * - Better code organization (separate concerns)
 * - Easier testing (test files independently)
 * - Improved maintainability (smaller file sizes)
 * - Clear separation of responsibilities
 *
 * Usage in routes:
 *   const clientsController = require('./controllers');
 *   router.get('/', clientsController.getAllClients);
 */

const crudController = require('./crud.controller');
const notesController = require('./notes.controller');

module.exports = {
  // CRUD operations (7 methods)
  getAllClients: crudController.getAllClients,
  getClientById: crudController.getClientById,
  createClient: crudController.createClient,
  updateClient: crudController.updateClient,
  archiveClient: crudController.archiveClient,
  deleteClient: crudController.deleteClient,
  batchDeleteClients: crudController.batchDeleteClients,

  // Notes operations (2 methods)
  addNote: notesController.addNote,
  bulkUpdateTags: notesController.bulkUpdateTags,
};
