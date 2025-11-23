/**
 * Status Configuration - Backend Barrel Export
 *
 * Single import point for all status-related backend configuration.
 *
 * Usage:
 * const {
 *   LISTING_STATUSES,
 *   LISTING_CATEGORIES,
 *   getCategoryStatuses,
 *   isValidTransition,
 * } = require('@/config/statuses');
 */

const statusDefinitions = require('./statusDefinitions');
const statusCategories = require('./statusCategories');

module.exports = {
  // Status Definitions
  ...statusDefinitions,

  // Status Categories
  ...statusCategories,
};
