import React from 'react';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';

/**
 * TotalLifetimeValueCard - Displays total lifetime value of all contacts
 *
 * Shows the sum of lifetime_value across all contacts.
 *
 * @param {Array} data - All contact data
 * @param {string} icon - MUI icon name (default: 'Paid')
 * @param {number} delay - Animation delay index
 */
const TotalLifetimeValueCard = ({
  data = [],
  icon = 'Paid',
  delay = 0,
  showPrivacy = true,
  ...props
}) => {
  // Calculate total lifetime value
  const totalValue = data.reduce((sum, contact) => {
    const value = parseFloat(contact.lifetime_value || contact.lifetimeValue || 0);
    return sum + value;
  }, 0);

  return (
    <DashboardStatCard
      icon={icon}
      title="LIFETIME VALUE"
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

export default TotalLifetimeValueCard;
