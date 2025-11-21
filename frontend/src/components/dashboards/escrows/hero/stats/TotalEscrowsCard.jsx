import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * TotalEscrowsCard - Displays count of escrows by status
 *
 * Reusable across Active, Closed, Cancelled, and All tabs
 *
 * @param {Array} data - All escrow data
 * @param {string} status - Filter status ('active', 'closed', 'cancelled', 'all')
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalEscrowsCard = ({
  data = [],
  status = 'active',
  icon,
  delay = 0,
  ...props
}) => {
  // Calculate count based on status
  const count = status === 'all'
    ? data.length
    : status === 'archived'
    ? data.filter(item => item.is_archived === true).length
    : data.filter(item => {
        const itemStatus = item.escrow_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      }).length;

  // Icon varies by status
  const defaultIcon = {
    active: 'Home',
    closed: 'CheckCircle',
    cancelled: 'Cancel',
    all: 'Dashboard',
    archived: 'Archive'
  }[status] || 'Home';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL ESCROWS"
      value={count}
      format="number"
      color="#42a5f5"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalEscrowsCard;
