import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * NewThisWeekCard - Shows count of new leads this week
 *
 * @param {Array} data - Leads data
 * @param {number} delay - Animation delay multiplier
 */
const NewThisWeekCard = ({ data = [], delay = 1, ...props }) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  // Count new leads created this week
  const newThisWeek = data.filter(item => {
    const createdAt = new Date(item.created_at);
    return createdAt >= startOfWeek;
  }).length;

  return (
    <DashboardStatCard
      icon="TrendingUp"
      title="NEW THIS WEEK"
      value={newThisWeek}
      format="number"
      color="#10b981"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default NewThisWeekCard;
