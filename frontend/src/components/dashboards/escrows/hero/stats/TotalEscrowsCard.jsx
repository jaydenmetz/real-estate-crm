import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * TotalEscrowsCard - Displays count of escrows by status
 *
 * Reusable across Active, Closed, Cancelled, and All tabs
 * Works with archived toggle to show archived items of current status
 *
 * @param {Array} data - All escrow data (pre-filtered by backend for archived)
 * @param {string} status - Filter status ('active', 'closed', 'cancelled', 'all')
 * @param {boolean} archivedOnly - Show only archived items (passed from toggle)
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalEscrowsCard = ({
  data = [],
  status = 'active',
  archivedOnly = false,
  icon,
  delay = 0,
  ...props
}) => {
  // Calculate count based on status
  // Data is already filtered by backend for archived/non-archived
  const count = status === 'All'
    ? data.length
    : data.filter(item => {
        const itemStatus = item.escrow_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      }).length;

  // Icon varies by status
  const defaultIcon = {
    active: 'Home',
    closed: 'CheckCircle',
    cancelled: 'Cancel',
    All: 'Dashboard'
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
