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
    value: 'Active',
    label: 'Active',
    preferredViewMode: 'card'
  },
  {
    value: 'Sold',
    label: 'Sold',
    preferredViewMode: 'list'
  },
  {
    value: 'Expired',
    label: 'Expired',
    preferredViewMode: 'list'
  },
  {
    value: 'All',
    label: 'All Listings',
    preferredViewMode: 'card'
  }
];
