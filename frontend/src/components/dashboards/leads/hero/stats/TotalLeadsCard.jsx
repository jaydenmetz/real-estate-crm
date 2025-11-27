import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * TotalLeadsCard - Shows total lead count
 * Filters by status if provided
 *
 * @param {Array} data - Leads data
 * @param {string} status - Optional status filter ('all', 'new', 'qualified', etc.)
 * @param {string} icon - Custom icon name
 * @param {number} delay - Animation delay multiplier
 */
const TotalLeadsCard = ({ data = [], status = 'all', icon, delay = 0, ...props }) => {
  // Count leads by status
  const count = status === 'all'
    ? data.length
    : data.filter(item => {
        const itemStatus = item.lead_status || item.status;
        return itemStatus?.toLowerCase() === status.toLowerCase();
      }).length;

  // Default icons based on status
  const defaultIcon = {
    all: 'People',
    new: 'PersonAdd',
    qualified: 'VerifiedUser',
    converted: 'CheckCircle'
  }[status] || 'People';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL LEADS"
      value={count}
      format="number"
      color="#ec4899"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalLeadsCard;
