import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * ConvertedThisMonthCard - Shows count of leads converted to clients this month
 *
 * @param {Array} data - Leads data
 * @param {number} delay - Animation delay multiplier
 */
const ConvertedThisMonthCard = ({ data = [], delay = 3, ...props }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Count converted leads in current month
  const convertedCount = data.filter(item => {
    const status = (item.lead_status || item.status || '').toLowerCase();

    // Check if converted this month
    if (status === 'converted' && item.converted_date) {
      const convertedDate = new Date(item.converted_date);
      return convertedDate.getMonth() === currentMonth &&
             convertedDate.getFullYear() === currentYear;
    }

    return false;
  }).length;

  return (
    <DashboardStatCard
      icon="CheckCircle"
      title="CONVERTED THIS MONTH"
      value={convertedCount}
      format="number"
      color="#6366f1"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default ConvertedThisMonthCard;
