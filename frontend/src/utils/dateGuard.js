/**
 * Date Guard Utility
 * Provides safe wrappers for date operations to prevent runtime errors
 */

/**
 * Safely creates a new Date object
 * @param {*} dateValue - Any value that might be a date
 * @returns {Date|null} Valid Date object or null
 */
export function safeNewDate(dateValue) {
  if (!dateValue) return null;
  
  // Handle empty strings, null, undefined
  if (dateValue === '' || dateValue === 'null' || dateValue === 'undefined') {
    return null;
  }
  
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return null;
  }
}

/**
 * Safely parse a date with a fallback
 * @param {*} dateValue - Any value that might be a date
 * @param {Date|null} fallback - Fallback value if parsing fails
 * @returns {Date|null} Valid Date object or fallback
 */
export function safeParseDateWithFallback(dateValue, fallback = null) {
  const parsed = safeNewDate(dateValue);
  return parsed || fallback;
}

/**
 * Check if a value can be parsed as a valid date
 * @param {*} value - Value to check
 * @returns {boolean} True if value can be parsed as a valid date
 */
export function isValidDateValue(value) {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return false;
  }
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Safe date comparison
 * @param {*} date1 - First date value
 * @param {*} date2 - Second date value
 * @returns {number|null} Difference in milliseconds or null if invalid
 */
export function safeDateDiff(date1, date2) {
  const d1 = safeNewDate(date1);
  const d2 = safeNewDate(date2);
  
  if (!d1 || !d2) return null;
  
  return d1.getTime() - d2.getTime();
}

export default {
  safeNewDate,
  safeParseDateWithFallback,
  isValidDateValue,
  safeDateDiff
};