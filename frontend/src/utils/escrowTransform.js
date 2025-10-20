/**
 * escrowTransform.js - Data transformation utilities for escrow objects
 *
 * Handles conversion between backend (snake_case) and frontend (camelCase) field names.
 * Provides a consistent interface for accessing escrow data regardless of naming convention.
 *
 * @since 1.0.6
 */

/**
 * Field mapping: backend snake_case → frontend camelCase
 */
const FIELD_MAP = {
  // Property Information
  property_address: 'propertyAddress',
  property_image: 'propertyImage',
  zillow_url: 'zillowUrl',

  // Financial Information
  purchase_price: 'purchasePrice',
  sale_price: 'salePrice',
  my_commission: 'myCommission',
  net_commission: 'netCommission',
  gross_commission: 'grossCommission',
  total_commission_rate: 'totalCommissionRate',

  // Status & Dates
  escrow_status: 'escrowStatus',
  escrow_number: 'escrowNumber',
  closing_date: 'closingDate',
  acceptance_date: 'acceptanceDate',
  scheduled_coe_date: 'scheduledCoeDate',
  actual_coe_date: 'actualCoeDate',
  open_date: 'openDate',
  close_date: 'closeDate',
  inspection_date: 'inspectionDate',
  appraisal_date: 'appraisalDate',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  deleted_at: 'deletedAt',

  // People
  buyer_name: 'buyerName',
  buyer_email: 'buyerEmail',
  buyer_phone: 'buyerPhone',
  seller_name: 'sellerName',
  seller_email: 'sellerEmail',
  seller_phone: 'sellerPhone',
  buyer_agent_name: 'buyerAgentName',
  listing_agent_name: 'listingAgentName',
  lender_name: 'lenderName',
  lender_company: 'lenderCompany',
  escrow_officer_name: 'escrowOfficerName',
  escrow_company: 'escrowCompany',

  // IDs
  user_id: 'userId',
  team_id: 'teamId',
  broker_id: 'brokerId',

  // Other
  days_to_close: 'daysToClose',
  checklist_progress: 'checklistProgress',
};

/**
 * Normalize an escrow object to use camelCase field names consistently
 *
 * @param {Object} escrow - Raw escrow object from backend (may have snake_case or camelCase fields)
 * @returns {Object} Normalized escrow object with camelCase fields
 */
export const normalizeEscrow = (escrow) => {
  if (!escrow) return null;

  const normalized = { ...escrow };

  // Convert all snake_case fields to camelCase
  Object.entries(FIELD_MAP).forEach(([snakeCase, camelCase]) => {
    if (escrow[snakeCase] !== undefined && normalized[camelCase] === undefined) {
      normalized[camelCase] = escrow[snakeCase];
    }
  });

  // Ensure critical fields have fallback values
  normalized.id = escrow.id;
  normalized.propertyAddress = normalized.propertyAddress || escrow.property_address || '';
  normalized.purchasePrice = parseFloat(normalized.purchasePrice || escrow.purchase_price || 0);
  normalized.myCommission = parseFloat(normalized.myCommission || escrow.my_commission || 0);
  normalized.escrowStatus = normalized.escrowStatus || escrow.escrow_status || 'Unknown';
  normalized.closingDate = normalized.closingDate || escrow.closing_date || null;

  return normalized;
};

/**
 * Normalize an array of escrow objects
 *
 * @param {Array} escrows - Array of raw escrow objects from backend
 * @returns {Array} Array of normalized escrow objects
 */
export const normalizeEscrows = (escrows) => {
  if (!Array.isArray(escrows)) return [];
  return escrows.map(normalizeEscrow).filter(Boolean);
};

/**
 * Get a field value from an escrow object, trying both camelCase and snake_case
 *
 * @param {Object} escrow - Escrow object
 * @param {string} fieldName - Field name in camelCase (e.g., 'propertyAddress')
 * @returns {*} Field value or undefined
 */
export const getEscrowField = (escrow, fieldName) => {
  if (!escrow) return undefined;

  // Try camelCase first
  if (escrow[fieldName] !== undefined) {
    return escrow[fieldName];
  }

  // Find snake_case equivalent
  const snakeCase = Object.entries(FIELD_MAP).find(([_, camel]) => camel === fieldName)?.[0];
  if (snakeCase && escrow[snakeCase] !== undefined) {
    return escrow[snakeCase];
  }

  return undefined;
};

/**
 * Convert a camelCase field name to snake_case for backend API calls
 *
 * @param {string} camelCase - Field name in camelCase
 * @returns {string} Field name in snake_case
 */
export const toSnakeCase = (camelCase) => {
  const snakeCase = Object.entries(FIELD_MAP).find(([_, camel]) => camel === camelCase)?.[0];
  return snakeCase || camelCase.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert an updates object with camelCase keys to snake_case for backend
 *
 * @param {Object} updates - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
export const toBackendFormat = (updates) => {
  if (!updates || typeof updates !== 'object') return updates;

  const converted = {};
  Object.entries(updates).forEach(([key, value]) => {
    const snakeKey = toSnakeCase(key);
    converted[snakeKey] = value;
  });

  return converted;
};

/**
 * Smart property address getter - tries multiple field names
 *
 * @param {Object} escrow - Escrow object
 * @returns {string} Property address or empty string
 */
export const getPropertyAddress = (escrow) => {
  return escrow?.propertyAddress || escrow?.property_address || '';
};

/**
 * Smart purchase price getter - ensures numeric value
 *
 * @param {Object} escrow - Escrow object
 * @returns {number} Purchase price or 0
 */
export const getPurchasePrice = (escrow) => {
  const price = escrow?.purchasePrice || escrow?.purchase_price || escrow?.salePrice || escrow?.sale_price || 0;
  return parseFloat(price) || 0;
};

/**
 * Smart commission getter - ensures numeric value
 *
 * @param {Object} escrow - Escrow object
 * @returns {number} Commission or 0
 */
export const getMyCommission = (escrow) => {
  const commission = escrow?.myCommission || escrow?.my_commission || escrow?.netCommission || escrow?.net_commission || 0;
  return parseFloat(commission) || 0;
};

/**
 * Smart status getter
 *
 * @param {Object} escrow - Escrow object
 * @returns {string} Escrow status or 'Unknown'
 */
export const getEscrowStatus = (escrow) => {
  return escrow?.escrowStatus || escrow?.escrow_status || 'Unknown';
};

/**
 * Smart closing date getter
 *
 * @param {Object} escrow - Escrow object
 * @returns {string|null} Closing date or null
 */
export const getClosingDate = (escrow) => {
  return escrow?.closingDate || escrow?.closing_date || escrow?.scheduledCoeDate || escrow?.scheduled_coe_date || null;
};

/**
 * Check if escrow is archived
 *
 * @param {Object} escrow - Escrow object
 * @returns {boolean} True if archived
 */
export const isArchived = (escrow) => {
  return !!(escrow?.deleted_at || escrow?.deletedAt || escrow?.details?.deletedAt);
};

export default {
  normalizeEscrow,
  normalizeEscrows,
  getEscrowField,
  toSnakeCase,
  toBackendFormat,
  getPropertyAddress,
  getPurchasePrice,
  getMyCommission,
  getEscrowStatus,
  getClosingDate,
  isArchived,
};
