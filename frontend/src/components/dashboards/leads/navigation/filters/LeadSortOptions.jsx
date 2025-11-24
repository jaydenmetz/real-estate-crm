/**
 * LeadSortOptions.jsx
 *
 * Sort option configuration for leads dashboard.
 *
 * Usage: Imported into leads.config.js as sortOptions array
 */

export const leadSortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_contact', label: 'Last Contact' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'priority', label: 'Priority' },
  { value: 'score', label: 'Lead Score' },
  { value: 'lead_status', label: 'Status' }
];

export const leadDefaultSort = 'created_at';
export const leadDefaultSortOrder = 'desc'; // Newest first
