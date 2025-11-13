/**
 * ListingStatusTabs.jsx
 *
 * Status tab configuration for listings dashboard navigation.
 * Defines which tabs appear and their default view modes.
 *
 * Usage: Imported into listings.config.js
 */

export const listingStatusTabs = [
  {
    value: 'active',
    label: 'Active',
    preferredViewMode: 'card'
  },
  {
    value: 'closed',
    label: 'Closed',
    preferredViewMode: 'list'
  },
  {
    value: 'expired',
    label: 'Expired',
    preferredViewMode: 'list'
  },
  {
    value: 'all',
    label: 'All Listings',
    preferredViewMode: 'table'
  },
  {
    value: 'archived',
    label: 'Archived',
    preferredViewMode: 'card'
  }
];
