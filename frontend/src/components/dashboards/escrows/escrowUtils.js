/**
 * Escrow Dashboard Utility Functions
 *
 * Common utility functions for escrow data processing and date handling
 * Extracted from EscrowsDashboard.jsx during Phase 7 refactoring
 * @since 1.0.5
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely parse a date value from various formats
 * @param {string|Date|null} dateValue - The date to parse
 * @returns {Date|null} A valid Date object or null
 */
export const safeParseDate = (dateValue) => {
  if (!dateValue) return null;

  try {
    // If it's already a Date object, check if valid
    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : null;
    }

    // Try to parse as ISO string
    const parsed = parseISO(dateValue);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Safely format a date for display
 * @param {string|Date|null} date - The date to format
 * @param {string} formatString - The format pattern (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string or empty string
 */
export const safeFormatDate = (date, formatString = 'MMM d, yyyy') => {
  const parsedDate = safeParseDate(date);
  if (!parsedDate) return '';

  try {
    return format(parsedDate, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Calculate date range based on filter
 * @param {string} filter - The date range filter (1D, 1M, 1Y, YTD)
 * @returns {Object} Object with startDate and endDate
 */
export const getDateRangeFromFilter = (filter) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  switch (filter) {
    case '1D':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: now };

    case '1M':
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return { startDate: lastMonth, endDate: now };

    case '1Y':
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      return { startDate: lastYear, endDate: now };

    case 'YTD':
      return { startDate: startOfYear, endDate: now };

    default:
      return { startDate: null, endDate: null };
  }
};

/**
 * Detect preset date range from custom dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {string|null} The matching preset or null
 */
export const detectPresetRange = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const now = new Date();
  const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Check for common presets
  if (daysDiff === 1) return '1D';
  if (daysDiff >= 28 && daysDiff <= 31) return '1M';
  if (daysDiff >= 365 && daysDiff <= 366) return '1Y';

  // Check for YTD
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  if (
    startDate.getTime() === startOfYear.getTime() &&
    Math.abs(endDate.getTime() - now.getTime()) < 86400000 // Within 1 day
  ) {
    return 'YTD';
  }

  return null;
};

/**
 * Generate chart data from escrows
 * @param {Array} escrowData - Array of escrow objects
 * @returns {Array} Chart data for the last 6 months
 */
export const generateChartData = (escrowData) => {
  if (!escrowData || !Array.isArray(escrowData)) {
    return [];
  }

  // Generate last 6 months of data
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });

    // Filter escrows for this month
    const monthEscrows = escrowData.filter(e => {
      const escrowDate = safeParseDate(e.acceptanceDate || e.acceptance_date);
      if (!escrowDate) return false;
      return (
        escrowDate.getMonth() === date.getMonth() &&
        escrowDate.getFullYear() === date.getFullYear()
      );
    });

    months.push({
      month: monthName,
      escrows: monthEscrows.length,
      volume: monthEscrows.reduce((sum, e) =>
        sum + Number(e.purchasePrice || e.purchase_price || 0), 0
      ) / 1000000, // Convert to millions
    });
  }

  return months;
};

/**
 * Filter escrows by status
 * @param {Array} escrows - Array of escrow objects
 * @param {string} status - Status to filter by (active, closed, cancelled, all)
 * @returns {Array} Filtered escrows
 */
export const filterEscrowsByStatus = (escrows, status) => {
  if (!escrows || !Array.isArray(escrows)) return [];

  // Filter out archived escrows (those with deleted_at set)
  const activeEscrows = escrows.filter(e =>
    !e.deleted_at && !e.deletedAt && !e.details?.deletedAt
  );

  switch (status) {
    case 'active':
      return activeEscrows.filter(e => {
        const escrowStatus = (e.escrowStatus || e.escrow_status || '').toLowerCase();
        return (
          escrowStatus === 'active under contract' ||
          escrowStatus === 'pending' ||
          escrowStatus === 'active'
        );
      });

    case 'closed':
      return activeEscrows.filter(e => {
        const escrowStatus = (e.escrowStatus || e.escrow_status || '').toLowerCase();
        return escrowStatus === 'closed' || escrowStatus === 'completed';
      });

    case 'cancelled':
      return activeEscrows.filter(e => {
        const escrowStatus = (e.escrowStatus || e.escrow_status || '').toLowerCase();
        return (
          escrowStatus === 'cancelled' ||
          escrowStatus === 'withdrawn' ||
          escrowStatus === 'expired'
        );
      });

    case 'all':
      return activeEscrows;

    default:
      return activeEscrows;
  }
};

/**
 * Sort escrows by specified field
 * @param {Array} escrows - Array of escrow objects
 * @param {string} sortBy - Field to sort by
 * @returns {Array} Sorted escrows
 */
export const sortEscrows = (escrows, sortBy) => {
  if (!escrows || !Array.isArray(escrows)) return [];

  return [...escrows].sort((a, b) => {
    let aVal, bVal;

    switch(sortBy) {
      case 'closing_date':
        aVal = new Date(a.closingDate || a.closing_date || 0);
        bVal = new Date(b.closingDate || b.closing_date || 0);
        return bVal - aVal; // Newest first

      case 'created_at':
        aVal = new Date(a.createdAt || a.created_at || 0);
        bVal = new Date(b.createdAt || b.created_at || 0);
        return bVal - aVal; // Newest first

      case 'sale_price':
        aVal = Number(a.purchasePrice || a.sale_price || 0);
        bVal = Number(b.purchasePrice || b.sale_price || 0);
        return bVal - aVal; // Highest first

      case 'property_address':
        aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
        bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z

      case 'escrow_status':
        aVal = (a.escrowStatus || a.escrow_status || '').toLowerCase();
        bVal = (b.escrowStatus || b.escrow_status || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z

      default:
        return 0;
    }
  });
};