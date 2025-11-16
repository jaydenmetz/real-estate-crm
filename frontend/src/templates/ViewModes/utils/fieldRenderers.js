/**
 * Field Renderers - Utilities for rendering different field types in view modes
 *
 * This module provides a unified way to render fields across all view-mode components,
 * eliminating duplicate rendering logic in Card/List/Table components.
 */

import { formatCurrency, formatDate } from '../../../utils/formatters';
import { format } from 'date-fns';

/**
 * Get nested field value from object using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Field path (e.g., 'user.firstName' or 'email')
 * @returns {*} Field value or undefined
 */
export const getFieldValue = (obj, path) => {
  if (!path) return undefined;

  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }

  return value;
};

/**
 * Format value based on field type
 * @param {*} value - Raw value
 * @param {string} format - Format type
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted value
 */
export const formatFieldValue = (value, format, options = {}) => {
  if (value === null || value === undefined) {
    return options.fallback || '—';
  }

  switch (format) {
    case 'currency':
      return formatCurrency(value, options);

    case 'date':
      return formatDate(value, options.dateFormat || 'MMM d, yyyy');

    case 'datetime':
      return formatDate(value, options.dateFormat || 'MMM d, yyyy h:mm a');

    case 'number':
      return value.toLocaleString();

    case 'percentage':
      return `${value}%`;

    case 'phone':
      // Simple phone formatting (can be enhanced)
      return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');

    case 'capitalize':
      return value.charAt(0).toUpperCase() + value.slice(1);

    case 'uppercase':
      return value.toUpperCase();

    case 'lowercase':
      return value.toLowerCase();

    case 'titleCase':
      return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    case 'boolean':
      return value ? (options.trueLabel || 'Yes') : (options.falseLabel || 'No');

    case 'truncate':
      const maxLength = options.maxLength || 50;
      return value.length > maxLength
        ? value.substring(0, maxLength) + '...'
        : value;

    default:
      return String(value);
  }
};

/**
 * Resolve field mapping - handles both simple strings and complex field configs
 * @param {Object} data - Source data object
 * @param {string|Object} fieldConfig - Field configuration
 * @returns {Object} { value, formatted, raw }
 */
export const resolveField = (data, fieldConfig) => {
  // Simple string field
  if (typeof fieldConfig === 'string') {
    const value = getFieldValue(data, fieldConfig);
    return {
      value,
      formatted: value,
      raw: value
    };
  }

  // Complex field config with formatting
  const {
    field,
    fields,      // Multiple field fallback
    format,
    transform,   // Custom transform function
    fallback,
    options = {}
  } = fieldConfig;

  // Handle multiple field fallback
  let rawValue;
  if (fields) {
    for (const f of fields) {
      rawValue = getFieldValue(data, f);
      if (rawValue !== undefined && rawValue !== null) break;
    }
  } else {
    rawValue = getFieldValue(data, field);
  }

  // Apply custom transform if provided
  if (transform && typeof transform === 'function') {
    rawValue = transform(rawValue, data);
  }

  // Format the value
  const formatted = formatFieldValue(rawValue, format, { ...options, fallback });

  return {
    value: formatted,
    formatted,
    raw: rawValue
  };
};

/**
 * Build full name from first/last name fields
 * @param {Object} data - Source data
 * @param {Object} config - Name field configuration
 * @returns {string} Full name
 */
export const buildFullName = (data, config = {}) => {
  const {
    firstNameFields = ['firstName', 'first_name'],
    lastNameFields = ['lastName', 'last_name'],
    separator = ' '
  } = config;

  let firstName, lastName;

  for (const field of firstNameFields) {
    firstName = getFieldValue(data, field);
    if (firstName) break;
  }

  for (const field of lastNameFields) {
    lastName = getFieldValue(data, field);
    if (lastName) break;
  }

  return [firstName, lastName].filter(Boolean).join(separator).trim() || 'Unknown';
};

/**
 * Get initials from name fields
 * @param {Object} data - Source data
 * @param {Object} config - Name field configuration
 * @returns {string} Initials (e.g., "JD")
 */
export const getInitials = (data, config = {}) => {
  const {
    firstNameFields = ['firstName', 'first_name'],
    lastNameFields = ['lastName', 'last_name']
  } = config;

  let firstName, lastName;

  for (const field of firstNameFields) {
    firstName = getFieldValue(data, field);
    if (firstName) break;
  }

  for (const field of lastNameFields) {
    lastName = getFieldValue(data, field);
    if (lastName) break;
  }

  const first = firstName ? firstName[0] : '';
  const last = lastName ? lastName[0] : '';

  return (first + last).toUpperCase() || '?';
};

/**
 * Get status color from constants
 * @param {Object} data - Source data
 * @param {Object} colorMap - Status to color mapping
 * @param {Object} config - Status field configuration
 * @returns {string} Color hex code
 */
export const getStatusColor = (data, colorMap, config = {}) => {
  const {
    statusFields = ['status'],
    defaultColor = '#6b7280'
  } = config;

  let status;
  for (const field of statusFields) {
    status = getFieldValue(data, field);
    if (status) break;
  }

  if (!status) return defaultColor;

  const normalizedStatus = status.toLowerCase();
  return colorMap[normalizedStatus] || defaultColor;
};

/**
 * Compute a derived field from multiple source fields
 * @param {Object} data - Source data
 * @param {Function} computer - Computation function
 * @returns {*} Computed value
 */
export const computeField = (data, computer) => {
  if (typeof computer !== 'function') {
    throw new Error('computeField requires a function');
  }
  return computer(data);
};

/**
 * Conditional field rendering
 * @param {Object} data - Source data
 * @param {Function|boolean} condition - Condition to evaluate
 * @param {*} fieldConfig - Field to render if true
 * @param {*} fallbackConfig - Field to render if false
 * @returns {Object} Resolved field
 */
export const conditionalField = (data, condition, fieldConfig, fallbackConfig = null) => {
  const shouldRender = typeof condition === 'function'
    ? condition(data)
    : condition;

  if (shouldRender && fieldConfig) {
    return resolveField(data, fieldConfig);
  }

  if (!shouldRender && fallbackConfig) {
    return resolveField(data, fallbackConfig);
  }

  return { value: null, formatted: null, raw: null };
};

export default {
  getFieldValue,
  formatFieldValue,
  resolveField,
  buildFullName,
  getInitials,
  getStatusColor,
  computeField,
  conditionalField
};
