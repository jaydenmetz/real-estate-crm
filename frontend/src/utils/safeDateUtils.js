import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely parse a date value
 * @param {*} dateValue - Date value to parse (string, Date, or invalid)
 * @returns {Date|null} Valid Date object or null
 */
export function safeParseDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    // If already a valid Date object
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // Try to parse string
    if (typeof dateValue === 'string') {
      // Handle empty strings, "null", "undefined", and other invalid strings
      const trimmed = dateValue.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
      
      // Try ISO parse first
      const parsed = parseISO(dateValue);
      if (isValid(parsed)) return parsed;
      
      // Try direct Date constructor
      const directParse = new Date(dateValue);
      return isNaN(directParse.getTime()) ? null : directParse;
    }
    
    // Try converting to Date
    const converted = new Date(dateValue);
    return isNaN(converted.getTime()) ? null : converted;
  } catch (error) {
    console.warn('Error parsing date:', dateValue, error);
    return null;
  }
}

/**
 * Safely format a date value
 * @param {*} dateValue - Date value to format
 * @param {string} formatString - Format string
 * @param {string} fallback - Fallback value if formatting fails
 * @returns {string} Formatted date string or fallback
 */
export function safeFormatDate(dateValue, formatString = 'MMM d, yyyy', fallback = 'N/A') {
  try {
    const date = safeParseDate(dateValue);
    if (!date) return fallback;
    
    return format(date, formatString);
  } catch (error) {
    console.warn('Error formatting date:', dateValue, error);
    return fallback;
  }
}

/**
 * Safely format relative time
 * @param {*} dateValue - Date value to format
 * @param {string} fallback - Fallback value if formatting fails
 * @returns {string} Relative time string or fallback
 */
export function safeFormatRelativeTime(dateValue, fallback = '') {
  try {
    const date = safeParseDate(dateValue);
    if (!date) return fallback;
    
    const now = new Date();
    const diffInMilliseconds = now - date;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 0) {
      return 'in the future';
    } else if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return safeFormatDate(date, 'MMM d, yyyy', fallback);
    }
  } catch (error) {
    console.warn('Error formatting relative time:', dateValue, error);
    return fallback;
  }
}

/**
 * Check if a date value is valid
 * @param {*} dateValue - Date value to check
 * @returns {boolean} True if valid date
 */
export function isValidDate(dateValue) {
  const parsed = safeParseDate(dateValue);
  return parsed !== null;
}

/**
 * Get safe timestamp for API calls
 * @returns {string} ISO timestamp
 */
export function getSafeTimestamp() {
  try {
    return new Date().toISOString();
  } catch (error) {
    return new Date(Date.now()).toISOString();
  }
}

export default {
  safeParseDate,
  safeFormatDate,
  safeFormatRelativeTime,
  isValidDate,
  getSafeTimestamp
};