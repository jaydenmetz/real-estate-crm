/**
 * AppointmentSortOptions.jsx
 *
 * Sort option configuration for appointments dashboard.
 *
 * Usage: Imported into appointments.config.js as sortOptions array
 */

export const appointmentSortOptions = [
  { value: 'appointment_date', label: 'Date & Time' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' }
];

export const appointmentDefaultSort = 'appointment_date';
export const appointmentDefaultSortOrder = 'asc'; // Upcoming appointments first
