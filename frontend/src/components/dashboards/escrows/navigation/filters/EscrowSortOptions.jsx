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
    value: 'property_address',
    label: 'Address'
  },
  {
    value: 'purchase_price',
    label: 'Purchase Price'
  },
  {
    value: 'commission_amount',
    label: 'Commission'
  },
  {
    value: 'acceptance_date',
    label: 'Acceptance Date'
  },
  {
    value: 'closing_date',
    label: 'Closing Date'
  }
];

export const escrowDefaultSort = 'closing_date';
