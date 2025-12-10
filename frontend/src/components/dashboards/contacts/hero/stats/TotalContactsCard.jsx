import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * TotalContactsCard - Displays total contacts count
 *
 * Works with the spheres layout to show contact statistics.
 *
 * @param {Array} data - All contact data
 * @param {string} roleFilter - Optional role filter ('sphere', 'lead', 'client', 'all')
 * @param {string} icon - MUI icon name (default: 'ContactPhone')
 * @param {number} delay - Animation delay index
 */
const TotalContactsCard = ({
  data = [],
  roleFilter = 'all',
  icon = 'ContactPhone',
  delay = 0,
  ...props
}) => {
  // Calculate count based on role filter
  const count = data.length;

  return (
    <DashboardStatCard
      icon={icon}
      title="TOTAL CONTACTS"
      value={count}
      format="number"
      color="#8B5CF6"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalContactsCard;
