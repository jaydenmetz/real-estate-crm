import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * TotalPortfolioCard - Displays total portfolio value of all contacts
 *
 * Shows the sum of total_portfolio across all contacts.
 * This represents the cumulative deal value for all contacts.
 *
 * @param {Array} data - All contact data
 * @param {string} icon - MUI icon name (default: 'AccountBalanceWallet')
 * @param {number} delay - Animation delay index
 * @param {boolean} showPrivacy - Enable privacy toggle
 */
const TotalPortfolioCard = ({
  data = [],
  icon = 'AccountBalanceWallet',
  delay = 0,
  showPrivacy = true,
  ...props
}) => {
  // Calculate total portfolio value
  const totalValue = data.reduce((sum, contact) => {
    const value = parseFloat(contact.total_portfolio || contact.totalPortfolio || 0);
    return sum + value;
  }, 0);

  return (
    <DashboardStatCard
      icon={icon}
      title="TOTAL PORTFOLIO"
      value={totalValue}
      prefix="$"
      format="currency"
      color="#10b981"
      textColor="#fff"
      delay={delay}
      showPrivacy={showPrivacy}
      {...props}
    />
  );
};

export default TotalPortfolioCard;
