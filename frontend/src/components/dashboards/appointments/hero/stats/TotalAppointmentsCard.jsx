import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * TotalAppointmentsCard - Shows total appointment count
 * Filters by status if provided
 *
 * @param {Array} data - Appointments data
 * @param {string} status - Optional status filter ('all', 'scheduled', 'confirmed', etc.)
 * @param {string} icon - Custom icon name
 * @param {number} delay - Animation delay multiplier
 */
const TotalAppointmentsCard = ({ data = [], status = 'all', icon, delay = 0, ...props }) => {
  // Count appointments by status
  const count = status === 'all'
    ? data.length
    : data.filter(item => {
        const itemStatus = item.appointment_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      }).length;

  // Default icons based on status
  const defaultIcon = {
    all: 'CalendarMonth',
    scheduled: 'EventNote',
    confirmed: 'EventAvailable',
    completed: 'CheckCircle'
  }[status] || 'CalendarMonth';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL APPOINTMENTS"
      value={count}
      format="number"
      color="#9c27b0"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalAppointmentsCard;
