/**
 * Listings Navigation Configuration
 *
 * Centralized exports for all listings navigation config files.
 * This file aggregates tabs, filters, and view mode configs.
 *
 * Architecture:
 * - tabs/ - Status tab configurations
 * - filters/ - Sort, scope, and view mode configurations
 *
 * Usage: Import from this index for cleaner imports in config
 */

// Tabs
export { listingStatusTabs } from './tabs/ListingStatusTabs';

// Filters
export {
  listingSortOptions,
  listingDefaultSort
} from './filters/ListingSortOptions';

export {
  getListingScopeOptions,
  listingDefaultScope
} from './filters/ListingScopeFilter';

export {
  listingViewModes,
  listingDefaultViewMode
} from './filters/ListingViewModes';
