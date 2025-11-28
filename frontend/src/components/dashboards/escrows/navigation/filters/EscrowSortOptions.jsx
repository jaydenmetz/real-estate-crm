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
    value: 'closing_date',
    label: 'Closing Date'
  },
  {
    value: 'acceptance_date',
    label: 'Acceptance Date'
  },
  {
    value: 'commission_amount',
    label: 'Commission'
  },
  {
    value: 'purchase_price',
    label: 'Purchase Price'
  },
  {
    value: 'property_address',
    label: 'Address'
  }
];

export const escrowDefaultSort = 'closing_date';
