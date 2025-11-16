/**
 * ClientSortOptions.jsx
 *
 * Sort options configuration for clients dashboard.
 *
 * Usage: Imported into clients.config.js as sortOptions array
 */

export const clientSortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_contact', label: 'Last Contact' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'budget', label: 'Budget' },
  { value: 'priority', label: 'Priority' }
];

export const clientDefaultSort = 'created_at';
