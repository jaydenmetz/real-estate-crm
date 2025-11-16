import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * CompletedThisMonthCard - Shows count of appointments completed this month
 *
 * @param {Array} data - Appointments data
 * @param {number} delay - Animation delay multiplier
 */
const CompletedThisMonthCard = ({ data = [], delay = 2, ...props }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Count completed appointments in current month
  const completedCount = data.filter(item => {
    const status = (item.appointment_status || item.status || '').toLowerCase();
    const appointmentDate = new Date(item.appointment_date || item.appointmentDate);

    const isCompletedThisMonth =
      status === 'completed' &&
      appointmentDate.getMonth() === currentMonth &&
      appointmentDate.getFullYear() === currentYear;

    return isCompletedThisMonth;
  }).length;

  return (
    <DashboardStatCard
      icon="CheckCircle"
      title="COMPLETED THIS MONTH"
      value={completedCount}
      format="number"
      color="#6366f1"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default CompletedThisMonthCard;
