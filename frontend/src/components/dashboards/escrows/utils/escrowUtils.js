// Utility functions for escrows dashboard

/**
 * Detect if custom dates match a preset range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string|null} - Matched preset ('1D', '1M', '1Y', 'YTD') or null
 */
export const detectPresetRange = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for 1 Day (today midnight to now)
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  if (Math.abs(start - todayMidnight) < 60000 && Math.abs(end - now) < 60000) {
    return '1D';
  }

  // Check for 1 Month (30 days ago to now)
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(now.getDate() - 30);
  if (Math.abs(start - oneMonthAgo) < 86400000 && Math.abs(end - now) < 86400000) {
    return '1M';
  }

  // Check for 1 Year (365 days ago to now)
  const oneYearAgo = new Date(now);
  oneYearAgo.setDate(now.getDate() - 365);
  if (Math.abs(start - oneYearAgo) < 86400000 && Math.abs(end - now) < 86400000) {
    return '1Y';
  }

  // Check for YTD (Jan 1 of current year to now)
  const yearStart = new Date(now.getFullYear(), 0, 1);
  if (Math.abs(start - yearStart) < 86400000 && Math.abs(end - now) < 86400000) {
    return 'YTD';
  }

  return null;
};

/**
 * Filter escrows based on status
 * @param {Array} escrows - Array of escrow objects
 * @param {string} status - Status filter ('active', 'archived', 'all')
 * @returns {Array} - Filtered escrows
 */
export const filterEscrows = (escrows, status) => {
  if (!Array.isArray(escrows)) return [];

  switch (status) {
    case 'active':
      return escrows.filter(
        (e) => e.escrow_status !== 'Closed' && e.escrow_status !== 'Cancelled'
      );
    case 'archived':
      return escrows.filter((e) => e.deleted_at || e.deletedAt);
    case 'all':
    default:
      return escrows;
  }
};

/**
 * Sort escrows based on sort field
 * @param {Array} escrows - Array of escrow objects
 * @param {string} sortBy - Sort field ('created_at', 'closing_date', 'purchase_price', etc.)
 * @returns {Array} - Sorted escrows
 */
export const sortEscrows = (escrows, sortBy) => {
  if (!Array.isArray(escrows)) return [];

  const sorted = [...escrows];

  switch (sortBy) {
    case 'created_at':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );
    case 'closing_date':
      return sorted.sort(
        (a, b) =>
          new Date(b.closing_date || b.closingDate) -
          new Date(a.closing_date || a.closingDate)
      );
    case 'purchase_price':
      return sorted.sort(
        (a, b) =>
          (b.purchase_price || b.purchasePrice || 0) -
          (a.purchase_price || a.purchasePrice || 0)
      );
    case 'property_address':
      return sorted.sort((a, b) =>
        (a.property_address || a.propertyAddress || '').localeCompare(
          b.property_address || b.propertyAddress || ''
        )
      );
    default:
      return sorted;
  }
};

/**
 * Calculate escrow stats from array
 * @param {Array} escrows - Array of escrow objects
 * @returns {Object} - Stats object
 */
export const calculateEscrowStats = (escrows) => {
  if (!Array.isArray(escrows) || escrows.length === 0) {
    return {
      total: 0,
      active: 0,
      activeVolume: 0,
      closedVolume: 0,
      pending: 0,
      closed: 0,
      cancelled: 0,
    };
  }

  const active = escrows.filter(
    (e) => e.escrow_status === 'Active' || e.escrow_status === 'Pending'
  );
  const closed = escrows.filter((e) => e.escrow_status === 'Closed');
  const cancelled = escrows.filter((e) => e.escrow_status === 'Cancelled');

  const activeVolume = active.reduce(
    (sum, e) => sum + Number(e.purchase_price || e.purchasePrice || 0),
    0
  );
  const closedVolume = closed.reduce(
    (sum, e) => sum + Number(e.purchase_price || e.purchasePrice || 0),
    0
  );

  return {
    total: escrows.length,
    active: active.length,
    activeVolume,
    closedVolume,
    pending: escrows.filter((e) => e.escrow_status === 'Pending').length,
    closed: closed.length,
    cancelled: cancelled.length,
  };
};
