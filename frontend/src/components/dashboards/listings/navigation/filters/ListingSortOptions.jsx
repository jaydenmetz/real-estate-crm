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
    value: 'listing_date',
    label: 'Beginning Date'
  },
  {
    value: 'list_price',
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
  },
  {
    value: 'listing_status',
    label: 'Status'
  },
  {
    value: 'created_at',
    label: 'Date Created'
  }
];

export const listingDefaultSort = 'listing_date';
