/**
 * Listing Dashboard Utility Functions
 *
 * Common utility functions for listing data processing and date handling
 * Extracted from ListingsDashboard.jsx during refactoring
 */

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
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
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // 1D - Today only
  if (isSameDay(start, today) && isSameDay(end, today)) {
    return '1D';
  }

  // 1M - Last 30 days
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  oneMonthAgo.setHours(0, 0, 0, 0);
  if (isSameDay(start, oneMonthAgo) && isSameDay(end, today)) {
    return '1M';
  }

  // 1Y - Last 365 days
  const oneYearAgo = new Date(now);
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  oneYearAgo.setHours(0, 0, 0, 0);
  if (isSameDay(start, oneYearAgo) && isSameDay(end, today)) {
    return '1Y';
  }

  // YTD - Start of year to today
  const yearStart = new Date(now.getFullYear(), 0, 1);
  yearStart.setHours(0, 0, 0, 0);
  if (isSameDay(start, yearStart) && isSameDay(end, today)) {
    return 'YTD';
  }

  return null;
};

/**
 * Filter listings by status
 * @param {Array} listings - Array of listing objects
 * @param {string} status - Status filter ('active', 'pending', 'sold', 'expired', 'archived', 'all')
 * @returns {Array} Filtered listings
 */
export const filterListingsByStatus = (listings, status) => {
  if (!listings || !Array.isArray(listings)) return [];

  switch (status) {
    case 'active':
      return listings.filter(l =>
        l.listingStatus === 'Active' || l.listing_status === 'Active' ||
        l.listingStatus === 'active' || l.listing_status === 'active'
      );
    case 'pending':
      return listings.filter(l =>
        l.listingStatus === 'Pending' || l.listing_status === 'Pending' ||
        l.listingStatus === 'pending' || l.listing_status === 'pending'
      );
    case 'sold':
      return listings.filter(l =>
        l.listingStatus === 'Sold' || l.listing_status === 'Sold' ||
        l.listingStatus === 'sold' || l.listing_status === 'sold'
      );
    case 'expired':
      return listings.filter(l =>
        l.listingStatus === 'Expired' || l.listing_status === 'Expired' ||
        l.listingStatus === 'expired' || l.listing_status === 'expired'
      );
    case 'archived':
      // Archived listings are already filtered
      return listings;
    default:
      return listings;
  }
};

/**
 * Sort listings by specified field
 * @param {Array} listings - Array of listing objects
 * @param {string} sortBy - Sort field ('listing_date', 'list_price', 'property_address', 'days_on_market', 'listing_status')
 * @returns {Array} Sorted listings
 */
export const sortListings = (listings, sortBy) => {
  if (!listings || !Array.isArray(listings)) return [];

  return [...listings].sort((a, b) => {
    let aVal, bVal;

    switch(sortBy) {
      case 'listing_date':
        aVal = new Date(a.listingDate || a.listing_date || 0);
        bVal = new Date(b.listingDate || b.listing_date || 0);
        return bVal - aVal; // Newest first
      case 'list_price':
        aVal = Number(a.listPrice || a.list_price || 0);
        bVal = Number(b.listPrice || b.list_price || 0);
        return bVal - aVal; // Highest first
      case 'property_address':
        aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
        bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      case 'days_on_market':
        const nowDate = new Date();
        const aDays = a.listingDate ? Math.floor((nowDate - new Date(a.listingDate)) / (1000 * 60 * 60 * 24)) : 0;
        const bDays = b.listingDate ? Math.floor((nowDate - new Date(b.listingDate)) / (1000 * 60 * 60 * 24)) : 0;
        return bDays - aDays; // Most days first
      case 'listing_status':
        aVal = (a.listingStatus || a.listing_status || '').toLowerCase();
        bVal = (b.listingStatus || b.listing_status || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      default:
        return 0;
    }
  });
};
