/**
 * Client Constants
 * Centralized configuration and constants for the clients module
 */

export const CLIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LEAD: 'lead',
  PAST_CLIENT: 'past_client',
  ARCHIVED: 'archived'
};

export const CLIENT_STATUS_LABELS = {
  [CLIENT_STATUS.ACTIVE]: 'Active',
  [CLIENT_STATUS.INACTIVE]: 'Inactive',
  [CLIENT_STATUS.LEAD]: 'Lead',
  [CLIENT_STATUS.PAST_CLIENT]: 'Past Client',
  [CLIENT_STATUS.ARCHIVED]: 'Archived'
};

export const CLIENT_STATUS_COLORS = {
  [CLIENT_STATUS.ACTIVE]: 'success',
  [CLIENT_STATUS.INACTIVE]: 'default',
  [CLIENT_STATUS.LEAD]: 'info',
  [CLIENT_STATUS.PAST_CLIENT]: 'default',
  [CLIENT_STATUS.ARCHIVED]: 'default'
};

export const CLIENT_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  BOTH: 'both',
  RENTER: 'renter',
  LANDLORD: 'landlord',
  INVESTOR: 'investor'
};

export const CLIENT_TYPE_LABELS = {
  [CLIENT_TYPES.BUYER]: 'Buyer',
  [CLIENT_TYPES.SELLER]: 'Seller',
  [CLIENT_TYPES.BOTH]: 'Buyer & Seller',
  [CLIENT_TYPES.RENTER]: 'Renter',
  [CLIENT_TYPES.LANDLORD]: 'Landlord',
  [CLIENT_TYPES.INVESTOR]: 'Investor'
};

export const CLIENT_SOURCES = {
  REFERRAL: 'referral',
  WEBSITE: 'website',
  SOCIAL_MEDIA: 'social_media',
  ZILLOW: 'zillow',
  REALTOR_COM: 'realtor_com',
  OPEN_HOUSE: 'open_house',
  COLD_CALL: 'cold_call',
  REPEAT_CLIENT: 'repeat_client',
  OTHER: 'other'
};

export const CLIENT_SOURCE_LABELS = {
  [CLIENT_SOURCES.REFERRAL]: 'Referral',
  [CLIENT_SOURCES.WEBSITE]: 'Website',
  [CLIENT_SOURCES.SOCIAL_MEDIA]: 'Social Media',
  [CLIENT_SOURCES.ZILLOW]: 'Zillow',
  [CLIENT_SOURCES.REALTOR_COM]: 'Realtor.com',
  [CLIENT_SOURCES.OPEN_HOUSE]: 'Open House',
  [CLIENT_SOURCES.COLD_CALL]: 'Cold Call',
  [CLIENT_SOURCES.REPEAT_CLIENT]: 'Repeat Client',
  [CLIENT_SOURCES.OTHER]: 'Other'
};

export const CLIENT_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const CLIENT_PRIORITY_LABELS = {
  [CLIENT_PRIORITY.HIGH]: 'High Priority',
  [CLIENT_PRIORITY.MEDIUM]: 'Medium Priority',
  [CLIENT_PRIORITY.LOW]: 'Low Priority'
};

export const CLIENT_PRIORITY_COLORS = {
  [CLIENT_PRIORITY.HIGH]: 'error',
  [CLIENT_PRIORITY.MEDIUM]: 'warning',
  [CLIENT_PRIORITY.LOW]: 'success'
};

export const CLIENT_FILTERS = {
  STATUS: 'status',
  TYPE: 'clientType',
  SOURCE: 'source',
  PRIORITY: 'priority',
  DATE_RANGE: 'dateRange',
  AGENT: 'agentId',
  SEARCH: 'search'
};

export const CLIENT_SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_contact', label: 'Last Contact' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'budget', label: 'Budget' },
  { value: 'priority', label: 'Priority' }
];

export const CLIENT_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table'
};

export const CLIENT_VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  lastName: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  phone: {
    required: false,
    pattern: /^\+?[1-9]\d{1,14}$/,
    maxLength: 20
  },
  budget: {
    min: 0,
    max: 999999999
  }
};

export const CLIENT_DEFAULT_VALUES = {
  status: CLIENT_STATUS.LEAD,
  clientType: CLIENT_TYPES.BUYER,
  priority: CLIENT_PRIORITY.MEDIUM,
  source: CLIENT_SOURCES.OTHER,
  notes: '',
  preferences: {},
  documents: []
};

export const BUDGET_RANGES = [
  { value: '0-100000', label: 'Under $100K' },
  { value: '100000-250000', label: '$100K - $250K' },
  { value: '250000-500000', label: '$250K - $500K' },
  { value: '500000-750000', label: '$500K - $750K' },
  { value: '750000-1000000', label: '$750K - $1M' },
  { value: '1000000-2000000', label: '$1M - $2M' },
  { value: '2000000-5000000', label: '$2M - $5M' },
  { value: '5000000-999999999', label: '$5M+' }
];

export const CONTACT_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi_weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  AS_NEEDED: 'as_needed'
};

export const CONTACT_FREQUENCY_LABELS = {
  [CONTACT_FREQUENCY.DAILY]: 'Daily',
  [CONTACT_FREQUENCY.WEEKLY]: 'Weekly',
  [CONTACT_FREQUENCY.BI_WEEKLY]: 'Bi-Weekly',
  [CONTACT_FREQUENCY.MONTHLY]: 'Monthly',
  [CONTACT_FREQUENCY.QUARTERLY]: 'Quarterly',
  [CONTACT_FREQUENCY.AS_NEEDED]: 'As Needed'
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

export const CLIENT_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_VIEW_MODE: CLIENT_VIEW_MODES.GRID,
  SEARCH_DEBOUNCE_MS: 300,
  CACHE_TTL_MS: 30000, // 30 seconds
  MAX_BULK_SELECTION: 100,
  EXPORT_FORMATS: ['csv', 'excel', 'pdf'],
  MAX_NOTES_LENGTH: 5000,
  MAX_DOCUMENTS: 50
};

export const PROPERTY_PREFERENCES = {
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  SQUARE_FEET: 'squareFeet',
  LOCATION: 'location',
  PROPERTY_TYPE: 'propertyType',
  FEATURES: 'features'
};
