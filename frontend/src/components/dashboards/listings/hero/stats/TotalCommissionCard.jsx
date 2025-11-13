import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * TotalCommissionCard - Displays total projected commissions
 *
 * Calculates total commission based on listing prices
 * Default commission rate: 3% (configurable per listing)
 *
 * @param {Array} data - All listing data
 * @param {string} status - Filter status ('active', 'closed', 'expired', 'all')
 * @param {number} defaultRate - Default commission rate (default: 3)
 * @param {number} delay - Animation delay index
 */
const TotalCommissionCard = ({
  data = [],
  status = 'active',
  defaultRate = 3,
  delay = 3,
  ...props
}) => {
  // Calculate total commission based on status
  const filteredListings = status === 'all'
    ? data
    : data.filter(item => {
        const itemStatus = item.listing_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      });

  const totalCommission = filteredListings.reduce((sum, listing) => {
    const price = parseFloat(listing.listing_price || listing.price || 0);
    const rate = parseFloat(listing.commission_rate || defaultRate);
    const commission = (price * rate) / 100;
    return sum + commission;
  }, 0);

  return (
    <DashboardStatCard
      icon="AttachMoney"
      title="TOTAL COMMISSION"
      value={totalCommission}
      format="currency"
      color="#6D28D9"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalCommissionCard;
