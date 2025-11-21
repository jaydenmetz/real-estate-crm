import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * TotalCommissionCard - Displays total commission by status
 *
 * Reusable across Active, Closed, Cancelled, and All tabs
 * For "All" tab: Shows Closed Commission - Cancelled Commission
 *
 * @param {Array} data - All escrow data
 * @param {string} status - Filter status ('active', 'closed', 'cancelled', 'all')
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalCommissionCard = ({
  data = [],
  status = 'active',
  icon,
  delay = 0,
  ...props
}) => {
  // Calculate commission
  let commission = 0;

  if (status === 'all') {
    // All tab: Closed Commission - Lost Commission
    const closedCommission = data
      .filter(item => {
        const itemStatus = item.escrow_status || item.status;
        return itemStatus?.toLowerCase() === 'closed';
      })
      .reduce((sum, item) => {
        const price = parseFloat(item.purchase_price || 0);
        const commissionPct = parseFloat(item.commission_percentage || 3);
        return sum + (price * (commissionPct / 100));
      }, 0);

    const lostCommission = data
      .filter(item => {
        const itemStatus = item.escrow_status || item.status;
        return itemStatus?.toLowerCase() === 'cancelled';
      })
      .reduce((sum, item) => {
        const price = parseFloat(item.purchase_price || 0);
        const commissionPct = parseFloat(item.commission_percentage || 3);
        return sum + (price * (commissionPct / 100));
      }, 0);

    commission = closedCommission - lostCommission;
  } else {
    // Single status
    commission = data
      .filter(item => {
        const itemStatus = item.escrow_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      })
      .reduce((sum, item) => {
        const price = parseFloat(item.purchase_price || 0);
        const commissionPct = parseFloat(item.commission_percentage || 3);
        return sum + (price * (commissionPct / 100));
      }, 0);
  }

  // Icon varies by status
  const defaultIcon = {
    active: 'Paid',
    closed: 'MonetizationOn',
    cancelled: 'MoneyOff',
    all: 'AccountBalanceWallet'
  }[status] || 'Paid';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL COMMISSION"
      value={commission}
      prefix="$"
      format="currency"
      color="#42a5f5"
      textColor="#fff"
      delay={delay}
      showPrivacy={true}
      {...props}
    />
  );
};

export default TotalCommissionCard;
