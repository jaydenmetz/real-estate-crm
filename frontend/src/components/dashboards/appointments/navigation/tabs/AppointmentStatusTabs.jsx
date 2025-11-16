/**
 * AppointmentStatusTabs.jsx
 *
 * Status tab configuration for appointments dashboard.
 *
 * Usage: Imported into appointments.config.js as statusTabs array
 */

export const appointmentStatusTabs = [
  { value: 'all', label: 'All Appointments' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived', label: 'Archived' }
];

export const appointmentDefaultStatus = 'scheduled';
