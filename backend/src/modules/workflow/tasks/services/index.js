/**
 * Tasks Module Services
 *
 * Barrel export for all task-related services.
 */

module.exports = {
  tasksService: require('./tasks.service'),
  checklistsService: require('./checklists.service'),
  checklistTemplatesService: require('./checklistTemplates.service'),
};
