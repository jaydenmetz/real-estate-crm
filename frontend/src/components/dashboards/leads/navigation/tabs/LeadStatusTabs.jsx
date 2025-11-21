/**
 * LeadStatusTabs.jsx
 *
 * Status tab configuration for leads dashboard.
 *
 * Usage: Imported into leads.config.js as statusTabs array
 */

export const leadStatusTabs = [
  { value: 'All', label: 'All Leads' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'converted', label: 'Converted' },
  { value: 'archived', label: 'Archived' }
];

export const leadDefaultStatus = 'new';
