import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * TotalClientsCard - Displays count of clients by status
 *
 * Reusable across Active, Inactive, Lead, and All tabs
 *
 * @param {Array} data - All client data
 * @param {string} status - Filter status ('active', 'inactive', 'lead', 'all')
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalClientsCard = ({
  data = [],
  status = 'active',
  icon,
  delay = 0,
  ...props
}) => {
  // Calculate count based on status
  const count = status === 'all'
    ? data.length
    : data.filter(item => {
        const itemStatus = item.client_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      }).length;

  // Icon varies by status
  const defaultIcon = {
    active: 'People',
    inactive: 'PersonOff',
    lead: 'PersonAdd',
    all: 'Dashboard'
  }[status] || 'People';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL CLIENTS"
      value={count}
      format="number"
      color="#8b5cf6"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalClientsCard;
