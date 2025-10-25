/**
 * Escrow Constants
 * Centralized configuration and constants for the escrows module
 */

export const ESCROW_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
  ON_HOLD: 'on_hold'
};

export const ESCROW_STATUS_LABELS = {
  [ESCROW_STATUS.ACTIVE]: 'Active',
  [ESCROW_STATUS.PENDING]: 'Pending',
  [ESCROW_STATUS.CLOSED]: 'Closed',
  [ESCROW_STATUS.CANCELLED]: 'Cancelled',
  [ESCROW_STATUS.ARCHIVED]: 'Archived',
  [ESCROW_STATUS.ON_HOLD]: 'On Hold'
};

export const ESCROW_STATUS_COLORS = {
  [ESCROW_STATUS.ACTIVE]: 'success',
  [ESCROW_STATUS.PENDING]: 'warning',
  [ESCROW_STATUS.CLOSED]: 'default',
  [ESCROW_STATUS.CANCELLED]: 'error',
  [ESCROW_STATUS.ARCHIVED]: 'default',
  [ESCROW_STATUS.ON_HOLD]: 'info'
};

export const ESCROW_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  REFINANCE: 'refinance',
  LEASE: 'lease'
};

export const ESCROW_TYPE_LABELS = {
  [ESCROW_TYPES.PURCHASE]: 'Purchase',
  [ESCROW_TYPES.SALE]: 'Sale',
  [ESCROW_TYPES.REFINANCE]: 'Refinance',
  [ESCROW_TYPES.LEASE]: 'Lease'
};

export const ESCROW_RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const ESCROW_RISK_COLORS = {
  [ESCROW_RISK_LEVELS.LOW]: 'success',
  [ESCROW_RISK_LEVELS.MEDIUM]: 'warning',
  [ESCROW_RISK_LEVELS.HIGH]: 'error'
};

export const ESCROW_FILTERS = {
  STATUS: 'status',
  DATE_RANGE: 'dateRange',
  AGENT: 'agentId',
  TYPE: 'type',
  RISK_LEVEL: 'riskLevel',
  PRICE_RANGE': 'priceRange',
  SEARCH: 'search'
};

export const ESCROW_SORT_OPTIONS = [
  { value: 'closingDate', label: 'Closing Date' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'propertyAddress', label: 'Property Address' },
  { value: 'purchasePrice', label: 'Purchase Price' },
  { value: 'status', label: 'Status' }
];

export const ESCROW_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
  CALENDAR: 'calendar'
};

export const ESCROW_MILESTONES = [
  { key: 'contract_signed', label: 'Contract Signed', icon: 'description' },
  { key: 'earnest_deposit', label: 'Earnest Money Deposited', icon: 'payments' },
  { key: 'inspection_scheduled', label: 'Inspection Scheduled', icon: 'event' },
  { key: 'inspection_completed', label: 'Inspection Completed', icon: 'fact_check' },
  { key: 'appraisal_ordered', label: 'Appraisal Ordered', icon: 'assessment' },
  { key: 'appraisal_completed', label: 'Appraisal Completed', icon: 'verified' },
  { key: 'loan_approved', label: 'Loan Approved', icon: 'approval' },
  { key: 'closing_scheduled', label: 'Closing Scheduled', icon: 'event_available' },
  { key: 'final_walkthrough', label: 'Final Walkthrough', icon: 'directions_walk' },
  { key: 'closed', label: 'Closed', icon: 'check_circle' }
];

export const ESCROW_VALIDATION_RULES = {
  propertyAddress: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  purchasePrice: {
    required: true,
    min: 0,
    max: 999999999
  },
  closingDate: {
    required: true,
    minDate: new Date()
  },
  commission: {
    min: 0,
    max: 100
  }
};

export const ESCROW_DEFAULT_VALUES = {
  status: ESCROW_STATUS.ACTIVE,
  type: ESCROW_TYPES.PURCHASE,
  commission: 3,
  contingencies: [],
  documents: [],
  notes: []
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

export const ESCROW_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_VIEW_MODE: ESCROW_VIEW_MODES.GRID,
  SEARCH_DEBOUNCE_MS: 300,
  CACHE_TTL_MS: 30000, // 30 seconds
  MAX_BULK_SELECTION: 100,
  EXPORT_FORMATS: ['csv', 'excel', 'pdf'],
  DEFAULT_COMMISSION_RATE: 3.0
};
