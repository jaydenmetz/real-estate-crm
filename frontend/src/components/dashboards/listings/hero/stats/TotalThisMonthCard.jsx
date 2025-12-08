import React from 'react';
import { startOfMonth } from 'date-fns';
import DashboardStatCard from '../../../../../components/common/ui/DashboardStatCard';
import { parseLocalDate } from '../../../../../utils/safeDateUtils';

/**
 * TotalThisMonthCard - Displays count of listings created this month
 *
 * Counts listings created in the current month for the given status
 *
 * @param {Array} data - All listing data
 * @param {string} status - Filter status ('active', 'closed', 'expired', 'all')
 * @param {string} dateField - Field to use for date filtering (default: 'created_at')
 * @param {number} delay - Animation delay index
 */
const TotalThisMonthCard = ({
  data = [],
  status = 'active',
  dateField = 'created_at',
  delay = 1,
  ...props
}) => {
  // Status groups for each category (matching statusCategories.js)
  const statusGroups = {
    active: ['active', 'active_under_contract', 'pending'],
    closed: ['closed'],
    expired: ['cancelled', 'expired', 'withdrawn'],
    all: null // All statuses
  };

  const monthStart = startOfMonth(new Date());

  // Filter by status and date
  const count = data.filter(item => {
    // Filter by status
    const itemStatus = item.listing_status || item.status;
    const validStatuses = statusGroups[status] || [status];
    const matchesStatus = status === 'all' || validStatuses.includes(itemStatus?.toLowerCase());

    if (!matchesStatus) return false;

    // Filter by date
    const dateValue = item[dateField];
    if (!dateValue) return false;

    const itemDate = parseLocalDate(dateValue);
    return itemDate >= monthStart;
  }).length;

  return (
    <DashboardStatCard
      icon="CalendarMonth"
      title="THIS MONTH"
      value={count}
      format="number"
      color="#A78BFA"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default TotalThisMonthCard;
