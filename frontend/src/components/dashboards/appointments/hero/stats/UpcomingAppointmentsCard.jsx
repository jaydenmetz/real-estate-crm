import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * UpcomingAppointmentsCard - Shows count of upcoming appointments
 * Filters for scheduled/confirmed appointments with future dates
 *
 * @param {Array} data - Appointments data
 * @param {number} delay - Animation delay multiplier
 */
const UpcomingAppointmentsCard = ({ data = [], delay = 1, ...props }) => {
  const now = new Date();

  // Count upcoming appointments (scheduled/confirmed with future dates)
  const upcomingCount = data.filter(item => {
    const status = (item.appointment_status || item.status || '').toLowerCase();
    const appointmentDate = new Date(item.appointment_date || item.appointmentDate);

    const isUpcoming = ['scheduled', 'confirmed'].includes(status) && appointmentDate > now;
    return isUpcoming;
  }).length;

  return (
    <DashboardStatCard
      icon="EventAvailable"
      title="UPCOMING"
      value={upcomingCount}
      format="number"
      color="#10b981"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default UpcomingAppointmentsCard;
