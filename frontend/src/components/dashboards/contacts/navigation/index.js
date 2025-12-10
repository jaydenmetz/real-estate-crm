/**
 * Contacts Navigation Configuration
 *
 * Centralized exports for all contacts navigation config files.
 * This file aggregates tabs, filters, and view mode configs.
 *
 * Architecture:
 * - tabs/ - Status tab configurations
 * - filters/ - Sort, scope, and view mode configurations
 *
 * Usage: Import from this index for cleaner imports in config
 */

// Tabs
export { contactStatusTabs } from './tabs/ContactStatusTabs';

// Filters
export {
  contactSortOptions,
  contactDefaultSort
} from './filters/ContactSortOptions';

export {
  getContactScopeOptions,
  contactDefaultScope
} from './filters/ContactScopeFilter';

export {
  contactViewModes,
  contactDefaultViewMode
} from './filters/ContactViewModes';
