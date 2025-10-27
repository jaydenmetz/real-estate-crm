/**
 * Client Dashboard Utility Functions
 *
 * Common utility functions for client data processing and date handling
 * Extracted from ClientsDashboard.jsx during refactoring
 */

/**
 * Safely parse a date, returning null if invalid
 * @param {string|Date} date - Date to parse
 * @returns {Date|null} Parsed date or null
 */
export const safeParseDate = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Check if custom dates match a preset range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string|null} The matching preset ('1D', '1M', '1Y', 'YTD') or null
 */
export const detectPresetRange = (start, end) => {
  if (!start || !end) return null;

  const now = new Date();
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if it's today (1D)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  if (start.getTime() === todayStart.getTime() && end.getTime() === todayEnd.getTime()) {
    return '1D';
  }

  // Check if it's last 30 days (1M)
  if (diffDays >= 29 && diffDays <= 31) {
    return '1M';
  }

  // Check if it's last 365 days (1Y)
  if (diffDays >= 364 && diffDays <= 366) {
    return '1Y';
  }

  // Check if it's year to date (YTD)
  const ytdStart = new Date(now.getFullYear(), 0, 1);
  if (start.getTime() === ytdStart.getTime() && end.getDate() === now.getDate()) {
    return 'YTD';
  }

  return null; // Custom range
};

/**
 * Filter clients by status
 * @param {Array} clients - Array of client objects
 * @param {string} status - Status filter ('active', 'lead', 'inactive', 'archived', 'all')
 * @returns {Array} Filtered clients
 */
export const filterClients = (clients, status) => {
  if (!clients || !Array.isArray(clients)) return [];

  switch (status) {
    case 'active':
      return clients.filter(c =>
        c.clientStatus === 'Active' || c.client_status === 'Active' ||
        c.clientStatus === 'active' || c.client_status === 'active'
      );
    case 'lead':
      return clients.filter(c =>
        c.clientStatus === 'Lead' || c.client_status === 'Lead' ||
        c.clientStatus === 'lead' || c.client_status === 'lead'
      );
    case 'inactive':
      return clients.filter(c =>
        c.clientStatus === 'Inactive' || c.client_status === 'Inactive' ||
        c.clientStatus === 'inactive' || c.client_status === 'inactive'
      );
    case 'archived':
      // Archived clients are already filtered
      return clients;
    default:
      return clients;
  }
};

/**
 * Sort clients by specified field
 * @param {Array} clients - Array of client objects
 * @param {string} sortBy - Sort field ('created_at', 'last_contact', 'name', 'total_value', 'status')
 * @returns {Array} Sorted clients
 */
export const sortClients = (clients, sortBy) => {
  if (!clients || !Array.isArray(clients)) return [];

  return [...clients].sort((a, b) => {
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
      case 'name':
        aVal = `${a.firstName || a.first_name || ''} ${a.lastName || a.last_name || ''}`.toLowerCase();
        bVal = `${b.firstName || b.first_name || ''} ${b.lastName || b.last_name || ''}`.toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      case 'total_value':
        aVal = Number(a.totalValue || a.total_value || 0);
        bVal = Number(b.totalValue || b.total_value || 0);
        return bVal - aVal; // Highest first
      case 'client_status':
        aVal = (a.clientStatus || a.client_status || '').toLowerCase();
        bVal = (b.clientStatus || b.client_status || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      default:
        return 0;
    }
  });
};
