import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * ClientValueCard - Displays total client portfolio value (sum of budgets)
 *
 * @param {Array} data - All client data
 * @param {number} delay - Animation delay index
 */
const ClientValueCard = ({
  data = [],
  delay = 3,
  ...props
}) => {
  // Sum all client budgets
  const totalValue = data.reduce((sum, item) => {
    const budget = parseFloat(item.budget || item.max_budget || 0);
    return sum + budget;
  }, 0);

  return (
    <DashboardStatCard
      icon="AttachMoney"
      title="TOTAL CLIENT VALUE"
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
