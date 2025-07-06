const constants = {
  // Entity types
  ENTITY_TYPES: {
    ESCROW: 'escrow',
    LISTING: 'listing',
    CLIENT: 'client',
    LEAD: 'lead',
    APPOINTMENT: 'appointment'
  },

  // Escrow statuses
  ESCROW_STATUS: {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
    ON_HOLD: 'On Hold'
  },

  // Listing statuses
  LISTING_STATUS: {
    COMING_SOON: 'Coming Soon',
    ACTIVE: 'Active',
    PENDING: 'Pending',
    SOLD: 'Sold',
    EXPIRED: 'Expired',
    WITHDRAWN: 'Withdrawn',
    CANCELLED: 'Cancelled'
  },

  // Client types
  CLIENT_TYPES: {
    BUYER: 'Buyer',
    SELLER: 'Seller',
    BOTH: 'Both',
    INVESTOR: 'Investor',
    REFERRAL: 'Referral'
  },

  // Client statuses
  CLIENT_STATUS: {
    ACTIVE: 'Active',
    PAST_CLIENT: 'Past Client',
    PROSPECT: 'Prospect',
    ARCHIVED: 'Archived'
  },

  // Lead statuses
  LEAD_STATUS: {
    NEW: 'New',
    CONTACTED: 'Contacted',
    QUALIFIED: 'Qualified',
    NURTURE: 'Nurture',
    APPOINTMENT_SET: 'Appointment Set',
    MET: 'Met',
    CONVERTED: 'Converted',
    LOST: 'Lost'
  },

  // Lead temperatures
  LEAD_TEMPERATURE: {
    HOT: 'Hot',
    WARM: 'Warm',
    COOL: 'Cool',
    COLD: 'Cold'
  },

  // Appointment types
  APPOINTMENT_TYPES: {
    LISTING_PRESENTATION: 'Listing Presentation',
    BUYER_CONSULTATION: 'Buyer Consultation',
    PROPERTY_SHOWING: 'Property Showing',
    OPEN_HOUSE: 'Open House',
    CLOSING: 'Closing',
    INSPECTION: 'Inspection',
    OTHER: 'Other'
  },

  // Appointment statuses
  APPOINTMENT_STATUS: {
    SCHEDULED: 'Scheduled',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show'
  },

  // Property types
  PROPERTY_TYPES: {
    SINGLE_FAMILY: 'Single Family',
    CONDO: 'Condo',
    TOWNHOUSE: 'Townhouse',
    MULTI_FAMILY: 'Multi-Family',
    LAND: 'Land',
    COMMERCIAL: 'Commercial'
  },

  // Contact methods
  CONTACT_METHODS: {
    CALL: 'Call',
    TEXT: 'Text',
    EMAIL: 'Email'
  },

  // Communication types
  COMMUNICATION_TYPES: {
    CALL: 'call',
    TEXT: 'text',
    EMAIL: 'email',
    MEETING: 'meeting',
    SHOWING: 'showing'
  },

  // Note types
  NOTE_TYPES: {
    GENERAL: 'general',
    CONVERSATION: 'conversation',
    MEETING: 'meeting',
    FOLLOW_UP: 'follow_up',
    INTERNAL: 'internal'
  },

  // Document types
  DOCUMENT_TYPES: {
    PURCHASE_AGREEMENT: 'purchase_agreement',
    LISTING_AGREEMENT: 'listing_agreement',
    DISCLOSURE: 'disclosure',
    INSPECTION_REPORT: 'inspection_report',
    APPRAISAL: 'appraisal',
    PHOTOS: 'photos',
    OTHER: 'other'
  },

  // AI Agent roles
  AI_ROLES: {
    EXECUTIVE: 'executive',
    MANAGER: 'manager',
    AGENT: 'agent'
  },

  // AI Agent departments
  AI_DEPARTMENTS: {
    MANAGEMENT: 'management',
    BUYER: 'buyer',
    LISTING: 'listing',
    OPERATIONS: 'operations'
  },

  // Webhook events
  WEBHOOK_EVENTS: {
    ESCROW_CREATED: 'escrow.created',
    ESCROW_UPDATED: 'escrow.updated',
    ESCROW_STATUS_CHANGED: 'escrow.status_changed',
    LISTING_CREATED: 'listing.created',
    LISTING_UPDATED: 'listing.updated',
    LISTING_STATUS_CHANGED: 'listing.status_changed',
    CLIENT_CREATED: 'client.created',
    CLIENT_UPDATED: 'client.updated',
    LEAD_CREATED: 'lead.created',
    LEAD_CONVERTED: 'lead.converted',
    APPOINTMENT_CREATED: 'appointment.created',
    APPOINTMENT_CANCELLED: 'appointment.cancelled'
  },

  // Tom Ferry best practices
  TOM_FERRY: {
    LEAD_RESPONSE_TARGET: 5, // minutes
    DAILY_CONVERSATIONS_TARGET: 20,
    TOUCHES_PER_YEAR: 33,
    EIGHT_BY_EIGHT_TOUCHES: 8, // 8 touches in 8 weeks
    MAX_DAYS_ON_MARKET: 30,
    TARGET_CONVERSION_RATE: 0.25, // 25%
    TARGET_LIST_TO_SALE_RATIO: 0.97 // 97%
  },

  // Database limits
  LIMITS: {
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE_SIZE: 20,
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_NOTE_LENGTH: 2000,
    MAX_TAG_LENGTH: 50,
    MAX_TAGS_PER_ENTITY: 20
  },

  // Regular expressions
  REGEX: {
    ID_FORMAT: /^[a-z]+_[a-zA-Z0-9]{12}$/,
    PHONE: /^\+?[\d\s\-\(\)\.]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
  },

  // Success messages
  MESSAGES: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    FOUND: 'Resource retrieved successfully'
  }
};

module.exports = constants;