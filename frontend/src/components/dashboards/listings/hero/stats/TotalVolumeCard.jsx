import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * TotalVolumeCard - Displays total listing value (sum of listing prices)
 *
 * Sums up listing_price for all listings matching the status
 *
 * @param {Array} data - All listing data
 * @param {string} status - Filter status ('active', 'closed', 'expired', 'all')
 * @param {number} delay - Animation delay index
 */
const TotalVolumeCard = ({
  data = [],
  status = 'active',
  delay = 2,
  ...props
}) => {
  // Calculate total value based on status
  const filteredListings = status === 'all'
    ? data
    : data.filter(item => {
        const itemStatus = item.listing_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      });

  const totalVolume = filteredListings.reduce((sum, listing) => {
    const price = parseFloat(listing.listing_price || listing.price || 0);
    return sum + price;
  }, 0);

  return (
    <DashboardStatCard
      icon="TrendingUp"
      title="TOTAL VALUE"
      value={totalVolume}
      format="currency"
      color="#7C3AED"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalVolumeCard;
