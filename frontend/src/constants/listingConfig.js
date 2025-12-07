import { alpha } from '@mui/material';

/**
 * Listing Constants - Centralized Configuration
 * All listing-related constants, statuses, and configurations in one place.
 * Follows the same pattern as escrowConfig.js and clientConfig.js
 */

// ========================================
// STATUS CONSTANTS
// Uses lowercase_snake_case keys (database-driven)
// Categories: active, won, lost
// ========================================

export const LISTING_STATUS = {
  ACTIVE: 'active',
  ACTIVE_UNDER_CONTRACT: 'active_under_contract',
  PENDING: 'pending',
  CLOSED: 'closed',
  EXPIRED: 'expired',
  WITHDRAWN: 'withdrawn',
  CANCELLED: 'cancelled'
};

export const LISTING_STATUS_LABELS = {
  [LISTING_STATUS.ACTIVE]: 'Active',
  [LISTING_STATUS.ACTIVE_UNDER_CONTRACT]: 'Active Under Contract',
  [LISTING_STATUS.PENDING]: 'Pending',
  [LISTING_STATUS.CLOSED]: 'Closed',
  [LISTING_STATUS.EXPIRED]: 'Expired',
  [LISTING_STATUS.WITHDRAWN]: 'Withdrawn',
  [LISTING_STATUS.CANCELLED]: 'Cancelled'
};

/**
 * Listing status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Uses lowercase_snake_case keys (database-driven):
 * - active [category: active]
 * - active_under_contract [category: active]
 * - pending [category: active]
 * - closed [category: won]
 * - expired [category: lost]
 * - withdrawn [category: lost]
 * - cancelled [category: lost]
 */
export const LISTING_STATUS_CONFIG = {
  'active': {
    color: '#10b981',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'trending_up',
    label: 'Active',
    category: 'active'
  },
  'active_under_contract': {
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#f59e0b', 0.2)}`,
    icon: 'handshake',
    label: 'Active Under Contract',
    category: 'active'
  },
  'pending': {
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#8b5cf6', 0.2)}`,
    icon: 'schedule',
    label: 'Pending',
    category: 'active'
  },
  'closed': {
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'check_circle',
    label: 'Closed',
    category: 'won'
  },
  'expired': {
    color: '#6b7280',
    bg: 'linear-gradient(135deg, rgba(107,114,128,0.08) 0%, rgba(75,85,99,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6b7280', 0.2)}`,
    icon: 'schedule',
    label: 'Expired',
    category: 'lost'
  },
  'withdrawn': {
    color: '#64748b',
    bg: 'linear-gradient(135deg, rgba(100,116,139,0.08) 0%, rgba(71,85,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#64748b', 0.2)}`,
    icon: 'remove_circle',
    label: 'Withdrawn',
    category: 'lost'
  },
  'cancelled': {
    color: '#ef4444',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'cancel',
    label: 'Cancelled',
    category: 'lost'
  }
};

// Simple color mapping for MUI chip variants
export const LISTING_STATUS_COLORS = {
  [LISTING_STATUS.ACTIVE]: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  [LISTING_STATUS.ACTIVE_UNDER_CONTRACT]: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  [LISTING_STATUS.PENDING]: {
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
  [LISTING_STATUS.CLOSED]: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  [LISTING_STATUS.EXPIRED]: {
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.1)',
  },
  [LISTING_STATUS.WITHDRAWN]: {
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.1)',
  },
  [LISTING_STATUS.CANCELLED]: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
};

// ========================================
// PROPERTY TYPES
// ========================================

export const LISTING_TYPES = {
  SINGLE_FAMILY: 'Single Family',
  CONDO: 'Condo',
  TOWNHOUSE: 'Townhouse',
  MULTI_FAMILY: 'Multi-Family',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
  MANUFACTURED: 'Manufactured',
  FARM_RANCH: 'Farm/Ranch'
};

export const LISTING_TYPE_LABELS = {
  [LISTING_TYPES.SINGLE_FAMILY]: 'Single Family',
  [LISTING_TYPES.CONDO]: 'Condo',
  [LISTING_TYPES.TOWNHOUSE]: 'Townhouse',
  [LISTING_TYPES.MULTI_FAMILY]: 'Multi-Family',
  [LISTING_TYPES.LAND]: 'Land',
  [LISTING_TYPES.COMMERCIAL]: 'Commercial',
  [LISTING_TYPES.MANUFACTURED]: 'Manufactured Home',
  [LISTING_TYPES.FARM_RANCH]: 'Farm/Ranch'
};

// ========================================
// FILTERS & SORTING
// ========================================

export const LISTING_FILTERS = {
  STATUS: 'status',
  DATE_RANGE: 'dateRange',
  AGENT: 'agentId',
  TYPE: 'propertyType',
  PRICE_RANGE: 'priceRange',
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  SEARCH: 'search'
};

export const LISTING_SORT_OPTIONS = [
  { value: 'listing_date', label: 'Beginning Date' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'list_price', label: 'List Price' },
  { value: 'property_address', label: 'Property Address' },
  { value: 'days_on_market', label: 'Days on Market' },
  { value: 'listing_status', label: 'Status' }
];

export const LISTING_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
  MAP: 'map'
};

// ========================================
// MARKETING FEATURES
// ========================================

export const LISTING_MARKETING_FEATURES = {
  PROFESSIONAL_PHOTOS: 'professional_photos',
  DRONE_PHOTOS: 'drone_photos',
  VIDEO_WALKTHROUGH: 'video_walkthrough',
  VIRTUAL_TOUR: 'virtual_tour',
  FLOOR_PLANS: 'floor_plans',
  STAGING: 'staging',
  OPEN_HOUSE: 'open_house'
};

export const LISTING_MARKETING_LABELS = {
  [LISTING_MARKETING_FEATURES.PROFESSIONAL_PHOTOS]: 'Professional Photos',
  [LISTING_MARKETING_FEATURES.DRONE_PHOTOS]: 'Drone Photos',
  [LISTING_MARKETING_FEATURES.VIDEO_WALKTHROUGH]: 'Video Walkthrough',
  [LISTING_MARKETING_FEATURES.VIRTUAL_TOUR]: 'Virtual Tour',
  [LISTING_MARKETING_FEATURES.FLOOR_PLANS]: 'Floor Plans',
  [LISTING_MARKETING_FEATURES.STAGING]: 'Professional Staging',
  [LISTING_MARKETING_FEATURES.OPEN_HOUSE]: 'Open House Scheduled'
};

// ========================================
// VALIDATION RULES
// ========================================

export const LISTING_VALIDATION_RULES = {
  propertyAddress: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  listPrice: {
    required: true,
    min: 0,
    max: 999999999
  },
  listingDate: {
    required: true,
    minDate: new Date()
  },
  commission: {
    min: 0,
    max: 100
  },
  bedrooms: {
    min: 0,
    max: 50
  },
  bathrooms: {
    min: 0,
    max: 50
  },
  squareFootage: {
    min: 0,
    max: 999999
  }
};

// ========================================
// DEFAULT VALUES
// ========================================

export const LISTING_DEFAULT_VALUES = {
  listingStatus: LISTING_STATUS.ACTIVE,
  propertyType: LISTING_TYPES.SINGLE_FAMILY,
  listingCommission: 3.0,
  buyerCommission: 2.5,
  professionalPhotos: false,
  dronePhotos: false,
  videoWalkthrough: false,
  features: [],
  photos: [],
  documents: []
};

// ========================================
// DATE RANGE PRESETS
// ========================================

export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  THIS_WEEK: 'thisWeek',
  THIS_MONTH: 'thisMonth',
  LAST_30_DAYS: 'last30Days',
  LAST_90_DAYS: 'last90Days',
  THIS_YEAR: 'thisYear',
  CUSTOM: 'custom'
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGE_PRESETS.TODAY]: 'Today',
  [DATE_RANGE_PRESETS.THIS_WEEK]: 'This Week',
  [DATE_RANGE_PRESETS.THIS_MONTH]: 'This Month',
  [DATE_RANGE_PRESETS.LAST_30_DAYS]: 'Last 30 Days',
  [DATE_RANGE_PRESETS.LAST_90_DAYS]: 'Last 90 Days',
  [DATE_RANGE_PRESETS.THIS_YEAR]: 'This Year',
  [DATE_RANGE_PRESETS.CUSTOM]: 'Custom Range'
};

// ========================================
// GENERAL CONSTANTS
// ========================================

export const LISTING_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_VIEW_MODE: LISTING_VIEW_MODES.GRID,
  SEARCH_DEBOUNCE_MS: 300,
  CACHE_TTL_MS: 30000, // 30 seconds
  MAX_BULK_SELECTION: 100,
  EXPORT_FORMATS: ['csv', 'excel', 'pdf'],
  DEFAULT_LISTING_COMMISSION: 3.0,
  DEFAULT_BUYER_COMMISSION: 2.5,
  MAX_PHOTOS: 50,
  MAX_PHOTO_SIZE_MB: 10,
  SUPPORTED_PHOTO_FORMATS: ['jpg', 'jpeg', 'png', 'webp']
};

// ========================================
// PRICE & PROPERTY FILTER OPTIONS
// ========================================

export const PRICE_RANGES = [
  { value: '0-100000', label: 'Under $100K' },
  { value: '100000-200000', label: '$100K - $200K' },
  { value: '200000-300000', label: '$200K - $300K' },
  { value: '300000-400000', label: '$300K - $400K' },
  { value: '400000-500000', label: '$400K - $500K' },
  { value: '500000-750000', label: '$500K - $750K' },
  { value: '750000-1000000', label: '$750K - $1M' },
  { value: '1000000-2000000', label: '$1M - $2M' },
  { value: '2000000-5000000', label: '$2M - $5M' },
  { value: '5000000-999999999', label: '$5M+' }
];

export const BEDROOM_OPTIONS = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' }
];

export const BATHROOM_OPTIONS = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' }
];

export const DAYS_ON_MARKET_RANGES = [
  { value: '0-7', label: '0-7 days (New)' },
  { value: '8-30', label: '8-30 days' },
  { value: '31-60', label: '31-60 days' },
  { value: '61-90', label: '61-90 days' },
  { value: '91-180', label: '91-180 days' },
  { value: '181-999999', label: '180+ days (Stale)' }
];

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get status config with fallback to active
 * Case-insensitive lookup - normalizes to lowercase
 * @param {string} status - Listing status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  if (!status) return LISTING_STATUS_CONFIG.active;
  const normalized = status.toLowerCase();
  return LISTING_STATUS_CONFIG[normalized] || LISTING_STATUS_CONFIG.active;
};

/**
 * Get listing status config (alias for getStatusConfig)
 * Case-insensitive lookup - normalizes to lowercase
 * @param {string} status - Listing status
 * @returns {object} Status configuration
 */
export const getListingStatusConfig = (status) => {
  if (!status) return LISTING_STATUS_CONFIG.active;
  const normalized = status.toLowerCase();
  return LISTING_STATUS_CONFIG[normalized] || LISTING_STATUS_CONFIG.active;
};
