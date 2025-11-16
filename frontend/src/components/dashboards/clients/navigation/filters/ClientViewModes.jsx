/**
 * ClientViewModes.jsx
 *
 * View mode options configuration for clients dashboard.
 *
 * Usage: Imported into clients.config.js as viewModes array
 */

export const clientViewModes = [
  { value: 'grid', label: 'Grid View', icon: 'GridView' },
  { value: 'list', label: 'List View', icon: 'ViewList' },
  { value: 'table', label: 'Table View', icon: 'TableRows' }
];

export const clientDefaultViewMode = 'grid';
