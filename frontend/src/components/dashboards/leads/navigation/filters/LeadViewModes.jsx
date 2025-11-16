/**
 * LeadViewModes.jsx
 *
 * View mode configuration for leads dashboard.
 * Supports grid, list, and table views.
 *
 * Usage: Imported into leads.config.js as viewModes array
 */

export const leadViewModes = [
  { value: 'grid', label: 'Grid View', icon: 'GridView' },
  { value: 'list', label: 'List View', icon: 'ViewList' },
  { value: 'table', label: 'Table View', icon: 'TableRows' }
];

export const leadDefaultViewMode = 'grid';
