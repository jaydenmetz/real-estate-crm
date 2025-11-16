import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * ActiveClientsCard - Displays count of active clients
 *
 * @param {Array} data - All client data
 * @param {number} delay - Animation delay index
 */
const ActiveClientsCard = ({
  data = [],
  delay = 1,
  ...props
}) => {
  // Count only active clients
  const count = data.filter(item => {
    const status = item.client_status || item.status;
    return status?.toLowerCase() === 'active';
  }).length;

  return (
    <DashboardStatCard
      icon="CheckCircle"
      title="ACTIVE CLIENTS"
      value={count}
      format="number"
      color="#10b981"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default ActiveClientsCard;
