/**
 * AppointmentViewModes.jsx
 *
 * View mode configuration for appointments dashboard.
 * Supports grid, list, table, and calendar views.
 *
 * Usage: Imported into appointments.config.js as viewModes array
 */

export const appointmentViewModes = [
  { value: 'grid', label: 'Grid View', icon: 'GridView' },
  { value: 'list', label: 'List View', icon: 'ViewList' },
  { value: 'table', label: 'Table View', icon: 'TableRows' },
  { value: 'calendar', label: 'Calendar View', icon: 'CalendarMonth' }
];

export const appointmentDefaultViewMode = 'grid';
