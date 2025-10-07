import { useMemo } from 'react';

/**
 * Custom hook for calculating escrow analytics and statistics
 * Extracted from EscrowsDashboard.jsx for reusability
 *
 * @param {Array} escrows - Array of escrow objects
 * @returns {Object} - Calculated statistics
 */
export function useEscrowAnalytics(escrows) {
  return useMemo(() => {
    if (!escrows || escrows.length === 0) {
      return {
        totalEscrows: 0,
        activeEscrows: 0,
        totalVolume: 0,
        projectedCommission: 0,
        closedThisMonth: 0,
        avgDaysToClose: 0,
        grossCommission: 0,
        myCommission: 0,
        ytdClosed: 0,
        ytdVolume: 0,
        monthClosed: 0,
        monthVolume: 0,
        closingThisWeek: 0,
        pendingActions: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Filter active escrows (not deleted)
    const activeEscrows = escrows.filter(e => !e.deleted_at);

    // Calculate total volume (sum of sale prices)
    const totalVolume = activeEscrows.reduce((sum, e) => sum + (e.sale_price || 0), 0);

    // Calculate projected commission
    const projectedCommission = activeEscrows.reduce((sum, e) => sum + (e.net_commission || e.my_commission || 0), 0);

    // Calculate gross commission
    const grossCommission = activeEscrows.reduce((sum, e) => sum + (e.total_commission || 0), 0);

    // Closed this month
    const closedThisMonth = activeEscrows.filter(e => {
      const closingDate = e.closing_date ? new Date(e.closing_date) : null;
      return closingDate && closingDate >= startOfMonth && closingDate <= now && e.escrow_status === 'closed';
    }).length;

    // Year-to-date metrics
    const ytdClosed = activeEscrows.filter(e => {
      const closingDate = e.closing_date ? new Date(e.closing_date) : null;
      return closingDate && closingDate >= startOfYear && closingDate <= now && e.escrow_status === 'closed';
    }).length;

    const ytdVolume = activeEscrows
      .filter(e => {
        const closingDate = e.closing_date ? new Date(e.closing_date) : null;
        return closingDate && closingDate >= startOfYear && closingDate <= now && e.escrow_status === 'closed';
      })
      .reduce((sum, e) => sum + (e.sale_price || 0), 0);

    // Month-to-date metrics
    const monthClosed = activeEscrows.filter(e => {
      const closingDate = e.closing_date ? new Date(e.closing_date) : null;
      return closingDate && closingDate >= startOfMonth && closingDate <= now && e.escrow_status === 'closed';
    }).length;

    const monthVolume = activeEscrows
      .filter(e => {
        const closingDate = e.closing_date ? new Date(e.closing_date) : null;
        return closingDate && closingDate >= startOfMonth && closingDate <= now && e.escrow_status === 'closed';
      })
      .reduce((sum, e) => sum + (e.sale_price || 0), 0);

    // Closing this week
    const closingThisWeek = activeEscrows.filter(e => {
      const closingDate = e.closing_date ? new Date(e.closing_date) : null;
      if (!closingDate) return false;

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return closingDate >= now && closingDate <= endOfWeek;
    }).length;

    // Average days to close (for closed escrows)
    const closedEscrows = activeEscrows.filter(e => e.escrow_status === 'closed');
    const avgDaysToClose = closedEscrows.length > 0
      ? Math.round(
          closedEscrows.reduce((sum, e) => {
            if (e.opening_date && e.closing_date) {
              const opened = new Date(e.opening_date);
              const closed = new Date(e.closing_date);
              const days = Math.ceil((closed - opened) / (1000 * 60 * 60 * 24));
              return sum + days;
            }
            return sum;
          }, 0) / closedEscrows.length
        )
      : 0;

    // Pending actions (escrows with upcoming tasks)
    const pendingActions = activeEscrows.filter(e => {
      const closingDate = e.closing_date ? new Date(e.closing_date) : null;
      return closingDate && closingDate > now && closingDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length;

    return {
      totalEscrows: escrows.length,
      activeEscrows: activeEscrows.length,
      totalVolume,
      projectedCommission,
      closedThisMonth,
      avgDaysToClose,
      grossCommission,
      myCommission: projectedCommission, // Alias for consistency
      ytdClosed,
      ytdVolume,
      monthClosed,
      monthVolume,
      closingThisWeek,
      pendingActions,
    };
  }, [escrows]);
}
