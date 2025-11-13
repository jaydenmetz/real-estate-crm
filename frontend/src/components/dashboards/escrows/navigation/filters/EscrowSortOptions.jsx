/**
 * EscrowSortOptions.jsx
 *
 * Sort dropdown configuration for escrows dashboard.
 * Defines available sort options and their display labels.
 *
 * Usage: Imported into escrows.config.js
 */

export const escrowSortOptions = [
  {
    value: 'created_at',
    label: 'Created'
  },
  {
    value: 'closing_date',
    label: 'Closing Date'
  },
  {
    value: 'purchase_price',
    label: 'Purchase Price'
  },
  {
    value: 'property_address',
    label: 'Property Address'
  }
];

export const escrowDefaultSort = 'created_at';
