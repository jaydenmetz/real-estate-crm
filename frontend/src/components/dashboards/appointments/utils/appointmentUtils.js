/**
 * Appointment Dashboard Utility Functions
 *
 * Common utility functions for appointment data processing and date handling
 * Extracted from AppointmentsDashboard.jsx during refactoring
 */

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Check if custom dates match a preset range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string|null} The matching preset ('1D', '1M', '1Y', 'YTD') or null
 */
export const detectPresetRange = (start, end) => {
  if (!start || !end) return null;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // 1D - Today only
  if (isSameDay(start, today) && isSameDay(end, today)) {
    return '1D';
  }

  // 1M - Last 30 days
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  oneMonthAgo.setHours(0, 0, 0, 0);
  if (isSameDay(start, oneMonthAgo) && isSameDay(end, today)) {
    return '1M';
  }

  // 1Y - Last 365 days
  const oneYearAgo = new Date(now);
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  oneYearAgo.setHours(0, 0, 0, 0);
  if (isSameDay(start, oneYearAgo) && isSameDay(end, today)) {
    return '1Y';
  }

  // YTD - Start of year to today
  const yearStart = new Date(now.getFullYear(), 0, 1);
  yearStart.setHours(0, 0, 0, 0);
  if (isSameDay(start, yearStart) && isSameDay(end, today)) {
    return 'YTD';
  }

  return null;
};

/**
 * Filter appointments by status
 * @param {Array} appointments - Array of appointment objects
 * @param {string} status - Status filter ('active', 'pending', 'sold', 'expired', 'archived', 'all')
 * @returns {Array} Filtered appointments
 */
export const filterAppointmentsByStatus = (appointments, status) => {
  if (!appointments || !Array.isArray(appointments)) return [];

  switch (status) {
    case 'active':
      return appointments.filter(l =>
        l.appointmentStatus === 'Active' || l.appointment_status === 'Active' ||
        l.appointmentStatus === 'active' || l.appointment_status === 'active'
      );
    case 'pending':
      return appointments.filter(l =>
        l.appointmentStatus === 'Pending' || l.appointment_status === 'Pending' ||
        l.appointmentStatus === 'pending' || l.appointment_status === 'pending'
      );
    case 'sold':
      return appointments.filter(l =>
        l.appointmentStatus === 'Sold' || l.appointment_status === 'Sold' ||
        l.appointmentStatus === 'sold' || l.appointment_status === 'sold'
      );
    case 'expired':
      return appointments.filter(l =>
        l.appointmentStatus === 'Expired' || l.appointment_status === 'Expired' ||
        l.appointmentStatus === 'expired' || l.appointment_status === 'expired'
      );
    case 'archived':
      // Archived appointments are already filtered
      return appointments;
    default:
      return appointments;
  }
};

/**
 * Sort appointments by specified field
 * @param {Array} appointments - Array of appointment objects
 * @param {string} sortBy - Sort field ('appointment_date', 'list_price', 'property_address', 'days_on_market', 'appointment_status')
 * @returns {Array} Sorted appointments
 */
export const sortAppointments = (appointments, sortBy) => {
  if (!appointments || !Array.isArray(appointments)) return [];

  return [...appointments].sort((a, b) => {
    let aVal, bVal;

    switch(sortBy) {
      case 'appointment_date':
        aVal = new Date(a.appointmentDate || a.appointment_date || 0);
        bVal = new Date(b.appointmentDate || b.appointment_date || 0);
        return bVal - aVal; // Newest first
      case 'list_price':
        aVal = Number(a.listPrice || a.list_price || 0);
        bVal = Number(b.listPrice || b.list_price || 0);
        return bVal - aVal; // Highest first
      case 'property_address':
        aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
        bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      case 'days_on_market':
        const nowDate = new Date();
        const aDays = a.appointmentDate ? Math.floor((nowDate - new Date(a.appointmentDate)) / (1000 * 60 * 60 * 24)) : 0;
        const bDays = b.appointmentDate ? Math.floor((nowDate - new Date(b.appointmentDate)) / (1000 * 60 * 60 * 24)) : 0;
        return bDays - aDays; // Most days first
      case 'appointment_status':
        aVal = (a.appointmentStatus || a.appointment_status || '').toLowerCase();
        bVal = (b.appointmentStatus || b.appointment_status || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      default:
        return 0;
    }
  });
};
