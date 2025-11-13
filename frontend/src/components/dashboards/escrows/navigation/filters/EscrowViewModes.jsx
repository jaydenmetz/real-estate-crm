/**
 * EscrowViewModes.jsx
 *
 * View mode configuration for escrows dashboard.
 * Defines available view modes (card/list/table) and default.
 *
 * Usage: Imported into escrows.config.js
 */

export const escrowViewModes = [
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

export const escrowDefaultViewMode = 'list';
