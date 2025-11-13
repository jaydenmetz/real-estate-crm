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
    preferredViewMode: 'list'
  },
  {
    value: 'Closed',
    label: 'Closed',
    preferredViewMode: 'list'
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    preferredViewMode: 'list'
  },
  {
    value: 'all',
    label: 'All Escrows',
    preferredViewMode: 'list'
  },
  {
    value: 'archived',
    label: 'Archived',
    preferredViewMode: 'card'
  }
];
