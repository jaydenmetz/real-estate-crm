/**
 * leadUtils.js - Utility functions for leads dashboard
 *
 * Date handling, filtering, and sorting functions
 * Extracted from LeadsDashboard.jsx during refactoring
 */

// Check if two dates are the same day
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Check if custom dates match a preset range
export const detectPresetRange = (start, end) => {
  if (!start || !end) return null;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Normalize the input dates to compare (ignore time)
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  // Check 1D (today)
  if (isSameDay(startDay, today) && isSameDay(endDay, today)) {
    return '1D';
  }

  // Check 1M (last 30 days) - end should be today
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setDate(today.getDate() - 30);
  if (isSameDay(startDay, oneMonthAgo) && isSameDay(endDay, today)) {
    return '1M';
  }

  // Check 1Y (last 365 days) - end should be today
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(today.getDate() - 365);
  if (isSameDay(startDay, oneYearAgo) && isSameDay(endDay, today)) {
    return '1Y';
  }

  // Check YTD (year to date) - end should be today
  const ytdStart = new Date(now.getFullYear(), 0, 1);
  if (isSameDay(startDay, ytdStart) && isSameDay(endDay, today)) {
    return 'YTD';
  }

  return null;
};

// Calculate date range based on filter or custom dates
export const getDateRange = (dateRangeFilter, customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate;

  // Use custom dates if both are set
  if (customStartDate && customEndDate) {
    return { startDate: customStartDate, endDate: customEndDate };
  }

  // Use preset ranges
  switch(dateRangeFilter) {
    case '1D':
      // Today from 12:00 AM to 11:59 PM
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case '1M':
      // Last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case '1Y':
      // Last 365 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'YTD':
      // Year to date
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      return null;
  }

  return { startDate, endDate };
};

// Filter leads by status
export const filterLeads = (leads, statusFilter) => {
  return leads.filter(l => {
    const status = (l.leadStatus || l.lead_status || '').toLowerCase();
    if (statusFilter === 'new') return status === 'new';
    if (statusFilter === 'qualified') return status === 'qualified';
    if (statusFilter === 'converted') return status === 'converted';
    if (statusFilter === 'lost') return status === 'lost';
    return true; // 'all' shows everything
  });
};

// Sort leads based on sort criteria
export const sortLeads = (leads, sortBy) => {
  return [...leads].sort((a, b) => {
    let aVal, bVal;

    switch(sortBy) {
      case 'created_at':
        aVal = new Date(a.createdAt || a.created_at || 0);
        bVal = new Date(b.createdAt || b.created_at || 0);
        return bVal - aVal; // Newest first
      case 'last_contact':
        aVal = new Date(a.lastContact || a.last_contact || 0);
        bVal = new Date(b.lastContact || b.last_contact || 0);
        return bVal - aVal; // Most recent first
      case 'source':
        aVal = (a.leadSource || a.lead_source || '').toLowerCase();
        bVal = (b.leadSource || b.lead_source || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      case 'score':
        aVal = Number(a.leadScore || a.lead_score || 0);
        bVal = Number(b.leadScore || b.lead_score || 0);
        return bVal - aVal; // Highest first
      case 'status':
        aVal = (a.leadStatus || a.lead_status || '').toLowerCase();
        bVal = (b.leadStatus || b.lead_status || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      default:
        return 0;
    }
  });
};

// Safe date parsing to avoid invalid date errors
export const safeParseDate = (dateValue) => {
  try {
    if (!dateValue) return null;
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (isNaN(parsed.getTime())) return null;
      return parsed;
    }
    if (!(dateValue instanceof Date)) return null;
    if (isNaN(dateValue.getTime())) return null;
    return dateValue;
  } catch (e) {
    console.error('Date parsing error:', e);
    return null;
  }
};
