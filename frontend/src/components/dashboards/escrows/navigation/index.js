/**
 * Escrows Navigation Configuration
 *
 * Centralized exports for all escrows navigation config files.
 * This file aggregates tabs, filters, and view mode configs.
 *
 * Architecture:
 * - tabs/ - Status tab configurations
 * - filters/ - Sort, scope, and view mode configurations
 *
 * Usage: Import from this index for cleaner imports in config
 */

// Tabs
export { escrowStatusTabs } from './tabs/EscrowStatusTabs';

// Filters
export {
  escrowSortOptions,
  escrowDefaultSort
} from './filters/EscrowSortOptions';

export {
  getEscrowScopeOptions,
  escrowDefaultScope
} from './filters/EscrowScopeFilter';

export {
  escrowViewModes,
  escrowDefaultViewMode
} from './filters/EscrowViewModes';
