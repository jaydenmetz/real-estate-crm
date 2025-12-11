import { format, parseISO, isValid } from 'date-fns';

/**
 * CRITICAL DATE/TIME HANDLING ARCHITECTURE
 * ==========================================
 *
 * We have TWO distinct types of date/time fields in PostgreSQL:
 *
 * 1. DATE (calendar dates, no time component):
 *    - acceptance_date, closing_date, birthday, listing_date, etc.
 *    - Stored as YYYY-MM-DD in database
 *    - MUST be timezone-independent: Nov 27 is Nov 27 everywhere
 *    - Use parseLocalDate() - creates midnight LOCAL time
 *
 * 2. TIMESTAMP WITH TIME ZONE (exact moments in time):
 *    - created_at, updated_at, last_login, completed_at, etc.
 *    - Stored with timezone info in database
 *    - MUST be timezone-aware: converted to user's local timezone
 *    - Use parseISO() or new Date() - respects timezone
 *
 * WRONG: Using parseISO() on DATE fields causes off-by-one-day bugs!
 * RIGHT: Use parseLocalDate() for DATE, parseISO() for TIMESTAMP
 */

/**
 * Parse a date-only string as LOCAL date (timezone-independent)
 * Use this for PostgreSQL DATE columns: acceptance_date, closing_date, etc.
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format (e.g., '2025-11-27')
 * @returns {Date|null} Date object at midnight local time, or null if invalid
 *
 * @example
 * parseLocalDate('2025-11-27') → Nov 27, 2025 00:00:00 in user's timezone
 * (NOT Nov 27, 2025 00:00:00 UTC which could display as Nov 26 in PST!)
 */
export function parseLocalDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;

  try {
    // Remove timestamp portion if present (e.g., '2025-11-27T00:00:00Z' → '2025-11-27')
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) return null;

    const [year, month, day] = parts.map(Number);

    // Validate ranges
    if (year < 1900 || year > 2100) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    // Create date at midnight LOCAL time (month is 0-indexed)
    const date = new Date(year, month - 1, day);

    // Verify the date is valid (handles invalid dates like Feb 30)
    if (isNaN(date.getTime())) return null;

    return date;
  } catch (error) {
    console.warn('Error parsing local date:', dateString, error);
    return null;
  }
}

/**
 * Safely parse a timestamp with timezone awareness
 * Use this for PostgreSQL TIMESTAMP WITH TIME ZONE columns: created_at, updated_at, etc.
 *
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

      // Try ISO parse first (respects timezone)
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

/**
 * Convert a Date object to YYYY-MM-DD string (timezone-safe)
 * Use this when saving DATE fields to the backend.
 *
 * This extracts local date components to ensure the date doesn't shift
 * due to timezone conversion. For example, if a user in PST selects
 * "December 13", this will always return "2025-12-13" regardless of
 * the Date object's internal UTC representation.
 *
 * @param {Date|string} dateValue - Date object or date string to convert
 * @returns {string|null} Date string in YYYY-MM-DD format, or null if invalid
 *
 * @example
 * // User selects December 13, 2025 in any timezone
 * toLocalDateString(new Date(2025, 11, 13)) → "2025-12-13"
 *
 * // Also handles string input (parses and re-formats)
 * toLocalDateString("2025-12-13") → "2025-12-13"
 */
export function toLocalDateString(dateValue) {
  if (!dateValue) return null;

  try {
    let date;

    // If it's a string, parse it first using parseLocalDate
    if (typeof dateValue === 'string') {
      date = parseLocalDate(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return null;
    }

    if (!date || isNaN(date.getTime())) return null;

    // Extract LOCAL date components (not UTC!)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error converting to local date string:', dateValue, error);
    return null;
  }
}

export default {
  parseLocalDate,
  safeParseDate,
  safeFormatDate,
  safeFormatRelativeTime,
  isValidDate,
  getSafeTimestamp,
  toLocalDateString
};