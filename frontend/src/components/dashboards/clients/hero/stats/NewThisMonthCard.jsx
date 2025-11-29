import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * NewThisMonthCard - Displays count of clients added this month
 *
 * @param {Array} data - All client data
 * @param {number} delay - Animation delay index
 */
const NewThisMonthCard = ({
  data = [],
  delay = 2,
  ...props
}) => {
  // Calculate this month's date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count clients created this month
  const count = data.filter(item => {
    const createdDate = new Date(item.created_at || item.createdAt);
    return createdDate >= startOfMonth;
  }).length;

  return (
    <DashboardStatCard
      icon="TrendingUp"
      title="NEW THIS MONTH"
      value={count}
      format="number"
      color="#f59e0b"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default NewThisMonthCard;
