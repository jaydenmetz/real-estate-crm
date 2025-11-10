// File: frontend/src/utils/formatters.js

import { format, parseISO, isValid, differenceInDays } from 'date-fns';

/**
 * Format currency values
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price with K/M suffix
 * @param {number} price - The price value to format
 * @param {boolean} includeDecimals - Whether to include decimal places for millions
 * @returns {string} Formatted price string (e.g., "300k", "1.2M")
 */
export function formatPriceShort(price, includeDecimals = true) {
  if (!price || price === 0) return '$0';
  
  const absPrice = Math.abs(price);
  
  if (absPrice >= 1000000) {
    const millions = absPrice / 1000000;
    const decimals = includeDecimals && millions < 10 ? 1 : 0;
    return `$${millions.toFixed(decimals)}M`;
  } else if (absPrice >= 1000) {
    return `$${(absPrice / 1000).toFixed(0)}k`;
  } else {
    return `$${absPrice.toFixed(0)}`;
  }
}

/**
 * Format date
 * @param {string|Date} date - Date to format (expects date-only strings like '2025-11-27')
 * @param {string} formatString - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 *
 * NOTE: For date-only fields (closing_date, acceptance_date, birthdays, etc.),
 * we parse and format WITHOUT timezone conversion to avoid off-by-one-day issues.
 * The date '2025-11-27' should display as Nov 27 regardless of user's timezone.
 */
export function formatDate(date, formatString = 'MMM d, yyyy') {
  if (!date) return '';

  try {
    let dateObj;

    if (typeof date === 'string') {
      // For date-only strings (YYYY-MM-DD), parse as local date to avoid timezone shifts
      // e.g., '2025-11-27' should be Nov 27, not Nov 26 in PST
      const parts = date.split('T')[0].split('-'); // Handle both '2025-11-27' and '2025-11-27T00:00:00Z'
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        dateObj = new Date(year, month - 1, day); // month is 0-indexed
      } else {
        dateObj = parseISO(date); // Fallback for other formats
      }
    } else {
      dateObj = date;
    }

    return isValid(dateObj) ? format(dateObj, formatString) : '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format time
 * @param {string} time - Time string (HH:mm:ss)
 * @param {string} formatString - Format string (default: 'h:mm a')
 * @returns {string} Formatted time string
 */
export function formatTime(time, formatString = 'h:mm a') {
  if (!time) return '';
  
  try {
    // Handle time-only strings by adding a date
    const timeObj = typeof time === 'string' 
      ? new Date(`1970-01-01T${time}`) 
      : time;
    
    return isValid(timeObj) ? format(timeObj, formatString) : time;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
}

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if can't format
  return phoneNumber;
}

/**
 * Format number with commas
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined) return '0%';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format address object
 * @param {object} address - Address object with street, city, state, zipCode
 * @returns {string} Formatted address string
 */
export function formatAddress(address) {
  if (!address || typeof address !== 'object') return '';
  
  const { street, city, state, zipCode } = address;
  const parts = [street, city, state, zipCode].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format full name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} preferredName - Preferred name (optional)
 * @returns {string} Formatted full name
 */
export function formatFullName(firstName, lastName, preferredName = null) {
  if (preferredName) return preferredName;
  
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ');
}

/**
 * Calculate days since a date
 * @param {string|Date} date - Date to calculate from
 * @returns {number} Number of days since the date
 */
export function daysSince(date) {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return differenceInDays(new Date(), dateObj);
  } catch (error) {
    console.error('Error calculating days since:', error);
    return null;
  }
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Get initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials
 */
export function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return first + last;
}

/**
 * Format status with color
 * @param {string} status - Status string
 * @param {object} colorMap - Map of status to color classes
 * @returns {object} Object with status and className
 */
export function formatStatus(status, colorMap = {}) {
  const defaultColors = {
    'Active': 'text-green-600 bg-green-50',
    'Pending': 'text-yellow-600 bg-yellow-50',
    'Completed': 'text-blue-600 bg-blue-50',
    'Closed': 'text-gray-600 bg-gray-50',
    'Cancelled': 'text-red-600 bg-red-50',
  };
  
  const colors = { ...defaultColors, ...colorMap };
  
  return {
    status,
    className: colors[status] || 'text-gray-600 bg-gray-50'
  };
}

/**
 * Format relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInMilliseconds = now - dateObj;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Parse and format JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed JSON or default value
 */
export function parseJSON(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortByKey(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}

/**
 * Parse currency string to number
 * @param {string|number} value - Currency value to parse
 * @returns {number} Parsed number
 */
export function parseCurrency(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;

  // Remove currency symbols and commas
  const cleaned = String(value).replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse percentage string to number
 * @param {string|number} value - Percentage value to parse
 * @returns {number} Parsed number
 */
export function parsePercentage(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;

  // Remove % symbol
  const cleaned = String(value).replace('%', '');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse phone number to clean digits
 * @param {string} value - Phone number to parse
 * @returns {string} Clean phone number string
 */
export function parsePhone(value) {
  if (!value) return '';

  // Remove all non-numeric characters
  return String(value).replace(/\D/g, '');
}

/**
 * Format duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2h 30m", "45s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

export default {
  formatCurrency,
  formatPriceShort,
  formatDate,
  formatTime,
  formatPhone,
  formatNumber,
  formatPercentage,
  formatAddress,
  formatFullName,
  daysSince,
  formatFileSize,
  formatDuration,
  truncateText,
  getInitials,
  formatStatus,
  formatRelativeTime,
  parseJSON,
  sortByKey,
  parseCurrency,
  parsePercentage,
  parsePhone
};