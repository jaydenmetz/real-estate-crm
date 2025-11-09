import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * TotalVolumeCard - Displays total purchase price volume by status
 *
 * Reusable across Active, Closed, Cancelled, and All tabs
 *
 * @param {Array} data - All escrow data
 * @param {string} status - Filter status ('active', 'closed', 'cancelled', 'all')
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalVolumeCard = ({
  data = [],
  status = 'active',
  icon,
  delay = 0,
  ...props
}) => {
  // Calculate total volume
  const volume = status === 'all'
    ? data.reduce((sum, item) => sum + parseFloat(item.purchase_price || 0), 0)
    : data
        .filter(item => {
          const itemStatus = item.escrow_status || item.status;
          return itemStatus?.toLowerCase() === status.toLowerCase();
        })
        .reduce((sum, item) => sum + parseFloat(item.purchase_price || 0), 0);

  // Icon varies by status
  const defaultIcon = {
    active: 'AttachMoney',
    closed: 'TrendingUp',
    cancelled: 'TrendingDown',
    all: 'AccountBalance'
  }[status] || 'AttachMoney';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL VOLUME"
      value={volume}
      prefix="$"
      format="currency"
      color="#42a5f5"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalVolumeCard;
