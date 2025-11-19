/**
 * ListingSortOptions.jsx
 *
 * Sort dropdown configuration for listings dashboard.
 * Defines available sort options and their display labels.
 *
 * Usage: Imported into listings.config.js
 */

export const listingSortOptions = [
  {
    value: 'created_at',
    label: 'Beginning Date'
  },
  {
    value: 'listing_price',
    label: 'List Price'
  },
  {
    value: 'property_address',
    label: 'Property Address'
  },
  {
    value: 'days_on_market',
    label: 'Days on Market'
  },
  {
    value: 'bedrooms',
    label: 'Bedrooms'
  },
  {
    value: 'square_feet',
    label: 'Square Feet'
  }
];

export const listingDefaultSort = 'created_at';
