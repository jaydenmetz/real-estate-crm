/**
 * Listing Constants
 * Centralized configuration and constants for the listings module
 */

export const LISTING_STATUS = {
  COMING_SOON: 'Coming Soon',
  ACTIVE: 'Active',
  PENDING: 'Pending',
  CLOSED: 'Closed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  WITHDRAWN: 'Withdrawn',
  ARCHIVED: 'archived'
};

export const LISTING_STATUS_LABELS = {
  [LISTING_STATUS.COMING_SOON]: 'Coming Soon',
  [LISTING_STATUS.ACTIVE]: 'Active',
  [LISTING_STATUS.PENDING]: 'Pending',
  [LISTING_STATUS.CLOSED]: 'Closed',
  [LISTING_STATUS.EXPIRED]: 'Expired',
  [LISTING_STATUS.CANCELLED]: 'Cancelled',
  [LISTING_STATUS.WITHDRAWN]: 'Withdrawn',
  [LISTING_STATUS.ARCHIVED]: 'Archived'
};

export const LISTING_STATUS_COLORS = {
  [LISTING_STATUS.COMING_SOON]: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  [LISTING_STATUS.ACTIVE]: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  [LISTING_STATUS.PENDING]: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  [LISTING_STATUS.CLOSED]: {
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
  },
  [LISTING_STATUS.EXPIRED]: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  [LISTING_STATUS.CANCELLED]: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  [LISTING_STATUS.WITHDRAWN]: {
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.1)',
  },
  [LISTING_STATUS.ARCHIVED]: {
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.1)',
  },
  // Default fallback
  Active: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
};

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

export const LISTING_DEFAULT_VALUES = {
  listingStatus: LISTING_STATUS.COMING_SOON,
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
