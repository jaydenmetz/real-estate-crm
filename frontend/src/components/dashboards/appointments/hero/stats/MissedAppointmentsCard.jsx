import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * MissedAppointmentsCard - Shows count of no-show/cancelled appointments
 *
 * @param {Array} data - Appointments data
 * @param {number} delay - Animation delay multiplier
 */
const MissedAppointmentsCard = ({ data = [], delay = 3, ...props }) => {
  // Count no-show and cancelled appointments
  const missedCount = data.filter(item => {
    const status = (item.appointment_status || item.status || '').toLowerCase();
    return ['no_show', 'cancelled'].includes(status);
  }).length;

  return (
    <DashboardStatCard
      icon="EventBusy"
      title="MISSED/CANCELLED"
      value={missedCount}
      format="number"
      color="#ef4444"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default MissedAppointmentsCard;
