import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * TotalListingsCard - Displays count of listings by status
 *
 * Reusable across Active, Closed, Expired, and All tabs
 *
 * @param {Array} data - All listing data
 * @param {string} status - Filter status ('active', 'closed', 'expired', 'all')
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalListingsCard = ({
  data = [],
  status = 'active',
  icon,
  delay = 0,
  ...props
}) => {
  // Status groups for each category (matching statusCategories.js)
  const statusGroups = {
    active: ['active', 'active_under_contract', 'pending'],
    closed: ['closed'],
    expired: ['cancelled', 'expired', 'withdrawn'],
    all: null // All statuses
  };

  // Calculate count based on status
  const count = status === 'all'
    ? data.length
    : data.filter(item => {
        const itemStatus = item.listing_status || item.status;
        const validStatuses = statusGroups[status] || [status];
        return validStatuses.includes(itemStatus?.toLowerCase());
      }).length;

  // Icon varies by status
  const defaultIcon = {
    active: 'Home',
    closed: 'CheckCircle',
    expired: 'EventBusy',
    all: 'Dashboard'
  }[status] || 'Home';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL LISTINGS"
      value={count}
      format="number"
      color="#8B5CF6"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalListingsCard;
