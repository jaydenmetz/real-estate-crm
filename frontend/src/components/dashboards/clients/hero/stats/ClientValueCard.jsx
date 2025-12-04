import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * ClientValueCard - Displays total commission earned from clients
 *
 * Commission = sum of net_commission from all escrows where each client
 * is buyer, seller, buyer agent, seller agent, or referral source.
 *
 * Includes both closed (realized) and active (pending) commissions.
 *
 * @param {Array} data - All client data (each client has lifetime_value field)
 * @param {number} delay - Animation delay index
 */
const ClientValueCard = ({
  data = [],
  delay = 3,
  ...props
}) => {
  // Sum commission across all clients
  // lifetime_value = closed_value + pending_value (calculated in backend)
  const totalValue = data.reduce((sum, item) => {
    const value = parseFloat(item.lifetime_value || 0);
    return sum + value;
  }, 0);

  return (
    <DashboardStatCard
      icon="AttachMoney"
      title="COMMISSION"
      value={totalValue}
      format="currency"
      color="#06b6d4"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default ClientValueCard;
