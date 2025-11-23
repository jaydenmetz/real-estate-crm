/**
 * Listings Helper Utilities
 *
 * Common utility functions used across the listings module.
 * Reduces code duplication and centralizes common logic.
 */

const { format, differenceInDays, parseISO } = require('date-fns');

/**
 * Format listing status for display
 * @param {string} status - Raw status from database
 * @returns {string} Formatted status
 */
function formatListingStatus(status) {
  const statusMap = {
    'Coming Soon': 'Coming Soon',
    'Active': 'Active',
    'Pending': 'Pending',
    'Closed': 'Closed',
    'Expired': 'Expired',
    'Withdrawn': 'Withdrawn',
    'Cancelled': 'Cancelled',
  };
  return statusMap[status] || status;
}

/**
 * Calculate days on market
 * @param {string|Date} listingDate - Listing date
 * @param {string|Date} endDate - End date (defaults to today)
 * @returns {number} Days on market
 */
function calculateDaysOnMarket(listingDate, endDate = new Date()) {
  try {
    const start = typeof listingDate === 'string' ? parseISO(listingDate) : listingDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return differenceInDays(end, start);
  } catch (error) {
    return 0;
  }
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {boolean} compact - Use compact notation (e.g., $1.2M)
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, compact = false) {
  if (amount == null || isNaN(amount)) return '$0';

  if (compact) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate property type
 * @param {string} type - Property type to validate
 * @returns {boolean} True if valid
 */
function validatePropertyType(type) {
  const validTypes = [
    'Single Family',
    'Condo',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Commercial',
  ];
  return validTypes.includes(type);
}

/**
 * Calculate price per square foot
 * @param {number} price - Listing price
 * @param {number} sqft - Square footage
 * @returns {number} Price per square foot
 */
function calculatePricePerSqFt(price, sqft) {
  if (!price || !sqft || sqft === 0) return 0;
  return Math.round(price / sqft);
}

/**
 * Determine if listing is stale
 * @param {string|Date} listingDate - Listing date
 * @param {number} threshold - Days threshold (default 90)
 * @returns {boolean} True if stale
 */
function isListingStale(listingDate, threshold = 90) {
  const daysOnMarket = calculateDaysOnMarket(listingDate);
  return daysOnMarket > threshold;
}

/**
 * Format listing address
 * @param {Object} listing - Listing object with address fields
 * @returns {string} Formatted address
 */
function formatAddress(listing) {
  const parts = [
    listing.propertyAddress || listing.property_address,
    listing.city,
    listing.state,
    listing.zipCode || listing.zip_code,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Calculate potential commission
 * @param {number} price - Sale price
 * @param {number} rate - Commission rate (as decimal, e.g., 0.03 for 3%)
 * @returns {number} Commission amount
 */
function calculateCommission(price, rate = 0.03) {
  if (!price || !rate) return 0;
  return Math.round(price * rate);
}

module.exports = {
  formatListingStatus,
  calculateDaysOnMarket,
  formatCurrency,
  validatePropertyType,
  calculatePricePerSqFt,
  isListingStale,
  formatAddress,
  calculateCommission,
};
