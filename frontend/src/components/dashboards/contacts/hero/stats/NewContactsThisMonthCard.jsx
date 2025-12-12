import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * NewContactsThisMonthCard - Displays count of contacts created this month
 *
 * Calculates how many contacts were created in the current month.
 *
 * @param {Array} data - All contact data
 * @param {string} icon - MUI icon name (default: 'PersonAdd')
 * @param {number} delay - Animation delay index
 */
const NewContactsThisMonthCard = ({
  data = [],
  icon = 'PersonAdd',
  delay = 0,
  ...props
}) => {
  // Calculate count for this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const count = data.filter(contact => {
    const createdAt = new Date(contact.created_at || contact.createdAt);
    return !isNaN(createdAt.getTime()) && createdAt >= monthStart;
  }).length;

  return (
    <DashboardStatCard
      icon={icon}
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

export default NewContactsThisMonthCard;
