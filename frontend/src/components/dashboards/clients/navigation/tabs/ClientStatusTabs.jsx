/**
 * ClientStatusTabs.jsx
 *
 * Status tab configuration for clients dashboard.
 *
 * Usage: Imported into clients.config.js as statusTabs array
 */

export const clientStatusTabs = [
  { value: 'All', label: 'All Clients' },
  { value: 'active', label: 'Active' },
  { value: 'lead', label: 'Leads' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' }
];

export const clientDefaultStatus = 'active';
