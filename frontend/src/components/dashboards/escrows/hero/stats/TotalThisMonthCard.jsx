import React from 'react';
import DashboardStatCard from '../../../../../components/common/DashboardStatCard';

/**
 * TotalThisMonthCard - Displays count of escrows created/closed/cancelled this month
 *
 * Reusable across Active, Closed, Cancelled, and All tabs
 *
 * @param {Array} data - All escrow data
 * @param {string} status - Filter status ('active', 'closed', 'cancelled', 'all')
 * @param {string} dateField - Which date to filter by ('created_at', 'closing_date', 'updated_at')
 * @param {string} icon - MUI icon name (default: varies by status)
 * @param {number} delay - Animation delay index
 */
const TotalThisMonthCard = ({
  data = [],
  status = 'active',
  dateField = 'created_at', // 'created_at' for active/all, 'closing_date' for closed, 'updated_at' for cancelled
  archivedOnly = false,
  icon,
  delay = 0,
  ...props
}) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate count for this month
  // Data is already filtered by backend for archived/non-archived
  const count = data.filter(item => {
    // Check status match
    if (status !== 'All') {
      const itemStatus = item.escrow_status || item.status;
      if (itemStatus?.toLowerCase() !== status.toLowerCase()) {
        return false;
      }
    }

    // Check date range
    const itemDate = new Date(item[dateField] || item[dateField.replace('_', '')]);
    return itemDate >= monthStart;
  }).length;

  // Icon varies by status
  const defaultIcon = {
    active: 'Schedule',
    closed: 'EventAvailable',
    cancelled: 'EventBusy',
    All: 'CalendarMonth'
  }[status] || 'Schedule';

  return (
    <DashboardStatCard
      icon={icon || defaultIcon}
      title="TOTAL THIS MONTH"
      value={count}
      format="number"
      color="#42a5f5"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalThisMonthCard;
