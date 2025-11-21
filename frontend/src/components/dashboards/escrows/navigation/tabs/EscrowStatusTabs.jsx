/**
 * EscrowStatusTabs.jsx
 *
 * Status tab configuration for escrows dashboard navigation.
 * Defines which tabs appear and their default view modes.
 *
 * Usage: Imported into escrows.config.js
 */

export const escrowStatusTabs = [
  {
    value: 'Active',
    label: 'Active',
    preferredViewMode: 'card'
  },
  {
    value: 'Closed',
    label: 'Closed',
    preferredViewMode: 'list'
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    preferredViewMode: 'table'
  },
  {
    value: 'All',
    label: 'All Escrows',
    preferredViewMode: 'table'
  }
];
