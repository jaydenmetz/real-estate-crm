import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';
import { usePrivacy } from '../../../../../contexts/PrivacyContext';

/**
 * TotalCommissionCard - Displays total projected commissions by status
 *
 * Reusable across Active, Closed, Cancelled, and All tabs
 * Works with archived toggle to show archived items of current status
 * For "All" tab: Shows Closed Commission - Cancelled Commission
 *
 * Master Toggle Behavior:
 * - Acts as master control for all commission privacy toggles in dashboard
 * - When clicked, toggles between showing/hiding all commissions
 * - Individual cards respect master state (forced hidden when master is hidden)
 *
 * @param {Array} data - All listing data (pre-filtered by backend for archived)
 * @param {string} status - Filter status ('Active', 'Closed', 'Cancelled', 'All')
 * @param {boolean} archivedOnly - Show only archived items (passed from toggle)
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalCommissionCard = ({
  data = [],
  status = 'active',
  archivedOnly = false,
  icon,
  delay = 0,
  ...props
}) => {
  // Access privacy context for master toggle
  const { masterHidden, toggleMaster } = usePrivacy();

  // Status groups for each category (matching statusCategories.js)
  const statusGroups = {
    active: ['active', 'active_under_contract', 'pending'],
    closed: ['closed'],
    expired: ['cancelled', 'expired', 'withdrawn'],
    all: null // All statuses
  };

  // Calculate commission
  // Data is already filtered by backend for archived/non-archived
  let commission = 0;

  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === 'all') {
    // All tab: Closed Commission - Cancelled Commission
    const closedCommission = data
      .filter(item => {
        const itemStatus = item.listing_status || item.status;
        return itemStatus?.toLowerCase() === 'closed';
      })
      .reduce((sum, item) => {
        const price = parseFloat(item.list_price || item.listing_price || 0);
        const commissionPct = parseFloat(item.total_commission || 3);
        return sum + (price * (commissionPct / 100));
      }, 0);

    // Expired category includes cancelled, expired, withdrawn
    const expiredStatuses = statusGroups.expired;
    const cancelledCommission = data
      .filter(item => {
        const itemStatus = item.listing_status || item.status;
        return expiredStatuses.includes(itemStatus?.toLowerCase());
      })
      .reduce((sum, item) => {
        const price = parseFloat(item.list_price || item.listing_price || 0);
        const commissionPct = parseFloat(item.total_commission || 3);
        return sum + (price * (commissionPct / 100));
      }, 0);

    commission = closedCommission - cancelledCommission;
  } else {
    // Single status category (Active, Closed, Expired, etc.)
    const validStatuses = statusGroups[normalizedStatus] || [normalizedStatus];
    commission = data
      .filter(item => {
        const itemStatus = item.listing_status || item.status;
        return validStatuses.includes(itemStatus?.toLowerCase());
      })
      .reduce((sum, item) => {
        const price = parseFloat(item.list_price || item.listing_price || 0);
        const commissionPct = parseFloat(item.total_commission || 3);
        return sum + (price * (commissionPct / 100));
      }, 0);
  }

  // Icon varies by status
  const defaultIcon = {
    active: 'Paid',
    closed: 'MonetizationOn',
    expired: 'MoneyOff',
    all: 'AccountBalanceWallet'
  }[normalizedStatus] || 'Paid';

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
      privacyControlled={true}
      isPrivate={masterHidden}
      onTogglePrivacy={toggleMaster}
      {...props}
    />
  );
};

export default TotalCommissionCard;
