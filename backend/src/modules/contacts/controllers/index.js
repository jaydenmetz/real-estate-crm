/**
 * Contacts Controllers Index
 *
 * Aggregates all contacts controller modules:
 * - CRUD operations (8 methods): list, getById, create, update, archive, unarchive, delete, search
 * - Roles operations (4 methods): getRoles, addRole, removeRole, setPrimaryRole
 *
 * This modular approach keeps controller files focused and maintainable.
 */

const crudController = require('./crud.controller');
const rolesController = require('./roles.controller');

module.exports = {
  // CRUD operations (8 methods)
  list: crudController.list,
  getById: crudController.getById,
  create: crudController.create,
  update: crudController.update,
  archive: crudController.archive,
  unarchive: crudController.unarchive,
  delete: crudController.delete,
  search: crudController.search,

  // Roles operations (4 methods)
  getRoles: rolesController.getRoles,
  addRole: rolesController.addRole,
  removeRole: rolesController.removeRole,
  setPrimaryRole: rolesController.setPrimaryRole,
};
