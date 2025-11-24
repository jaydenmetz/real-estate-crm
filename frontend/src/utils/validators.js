/**
 * Field Validation Utilities
 * Centralized validation functions for phone, email, and license fields
 */

/**
 * Validate phone number
 * Accepts 10-digit US phone or 11-digit with country code
 *
 * @param {string} value - Phone number to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePhone = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Strip all non-numeric characters
  const cleaned = value.replace(/\D/g, '');

  // Accept 10-digit US format: (555) 123-4567
  if (cleaned.length === 10) {
    return { valid: true, error: null };
  }

  // Accept 11-digit with country code: +1 (555) 123-4567
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return { valid: true, error: null };
  }

  return {
    valid: false,
    error: 'Phone must be 10 digits (e.g., 555-123-4567)'
  };
};

/**
 * Validate email address
 * Uses standard email regex pattern
 *
 * @param {string} value - Email address to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateEmail = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Trim whitespace
  const trimmed = value.trim();

  // Standard email regex (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid email format (e.g., user@example.com)'
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate CalDRE license number
 * California Department of Real Estate licenses are 8-digit numbers
 *
 * @param {string} value - License number to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateLicense = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'License number is required' };
  }

  // Strip all non-numeric characters (remove "DRE", "#", spaces, etc.)
  const cleaned = value.replace(/[^0-9]/g, '');

  // Must be exactly 8 digits
  if (cleaned.length !== 8) {
    return {
      valid: false,
      error: 'License must be exactly 8 digits'
    };
  }

  // CA DRE licenses start with 0, 1, or 2
  // 0 = Salesperson, 1 = Broker, 2 = Corporation
  const firstDigit = cleaned[0];
  if (!['0', '1', '2'].includes(firstDigit)) {
    return {
      valid: false,
      error: 'CA DRE licenses must start with 0, 1, or 2'
    };
  }

  return { valid: true, error: null };
};

/**
 * Format phone number for display
 * Converts raw digits to (XXX) XXX-XXXX format
 *
 * @param {string} value - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneDisplay = (value) => {
  if (!value) return '';

  const cleaned = value.replace(/\D/g, '');

  // Format 10-digit: (555) 123-4567
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Format 11-digit with country code: +1 (555) 123-4567
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return value; // Return as-is if can't format
};

/**
 * Format license number for display
 * Converts 8-digit number to DRE #XXXXXXXX format
 *
 * @param {string} value - Raw license number
 * @returns {string} Formatted license number
 */
export const formatLicenseDisplay = (value) => {
  if (!value) return '';

  const cleaned = value.replace(/[^0-9]/g, '');

  if (cleaned.length === 8) {
    return `DRE #${cleaned}`;
  }

  return value; // Return as-is if not 8 digits
};

/**
 * Parse phone number for storage
 * Strips all non-numeric characters
 *
 * @param {string} value - Formatted phone number
 * @returns {string} Raw digits only
 */
export const parsePhoneForStorage = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Parse email for storage
 * Trims whitespace and converts to lowercase
 *
 * @param {string} value - Email address
 * @returns {string} Cleaned email
 */
export const parseEmailForStorage = (value) => {
  if (!value) return '';
  return value.trim().toLowerCase();
};

/**
 * Parse license number for storage
 * Strips all non-numeric characters
 *
 * @param {string} value - Formatted license number
 * @returns {string} Raw 8 digits only
 */
export const parseLicenseForStorage = (value) => {
  if (!value) return '';
  return value.replace(/[^0-9]/g, '');
};
