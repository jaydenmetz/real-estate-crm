/**
 * ListingViewModes.jsx
 *
 * View mode configuration for listings dashboard.
 * Defines available view modes (card/list/table) and default.
 *
 * Usage: Imported into listings.config.js
 */

export const listingViewModes = [
  {
    value: 'card',
    label: 'Card',
    icon: 'GridView'
  },
  {
    value: 'list',
    label: 'List',
    icon: 'ViewList'
  },
  {
    value: 'table',
    label: 'Table',
    icon: 'TableChart'
  }
];

export const listingDefaultViewMode = 'card';
