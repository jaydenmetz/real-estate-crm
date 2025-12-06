/**
 * Appointments Controllers Index
 *
 * Aggregates all appointment controller modules and exports them as a single interface.
 * This file serves as the main entry point for appointment-related business logic.
 *
 * Structure:
 * - crud.controller.js: CRUD operations (7 methods) + stops/attendees (6 methods)
 * - status.controller.js: Status management operations (2 methods)
 *
 * Total: 15 exported methods
 *
 * @module modules/appointments/controllers
 */

const crudController = require('./crud.controller');
const statusController = require('./sub-resources/status.controller');

module.exports = {
  // CRUD operations (7 methods)
  getAppointments: crudController.getAppointments,
  getAppointment: crudController.getAppointment,
  createAppointment: crudController.createAppointment,
  updateAppointment: crudController.updateAppointment,
  archiveAppointment: crudController.archiveAppointment,
  deleteAppointment: crudController.deleteAppointment,
  batchDeleteAppointments: crudController.batchDeleteAppointments,

  // Status management operations (2 methods)
  cancelAppointment: statusController.cancelAppointment,
  markComplete: statusController.markComplete,

  // Stops management (3 methods)
  updateStops: crudController.updateStops,
  addStop: crudController.addStop,
  deleteStop: crudController.deleteStop,

  // Attendees management (3 methods)
  updateAttendees: crudController.updateAttendees,
  addAttendee: crudController.addAttendee,
  removeAttendee: crudController.removeAttendee,
};
