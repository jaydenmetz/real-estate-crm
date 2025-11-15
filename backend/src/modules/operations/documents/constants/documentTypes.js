/**
 * Document Types for Real Estate CRM
 * Used to classify and organize documents by their purpose
 */

const DOCUMENT_TYPES = {
  // Escrow Documents
  ESCROW_OPENING: 'escrow_opening',
  ESCROW_INSTRUCTIONS: 'escrow_instructions',
  PRELIMINARY_TITLE_REPORT: 'preliminary_title_report',
  FINAL_CLOSING_STATEMENT: 'final_closing_statement',
  ESCROW_OTHER: 'escrow_other',

  // Transaction Documents (CAR Forms)
  PURCHASE_AGREEMENT: 'purchase_agreement',
  LISTING_AGREEMENT: 'listing_agreement',
  BUYER_REPRESENTATION: 'buyer_representation',
  SHOWING_AGREEMENT: 'showing_agreement',
  REFERRAL_AGREEMENT: 'referral_agreement',
  DISCLOSURE_STATEMENT: 'disclosure_statement',
  INSPECTION_REPORT: 'inspection_report',
  AMENDMENT: 'amendment',
  ADDENDUM: 'addendum',

  // Financial Documents
  PRE_APPROVAL_LETTER: 'pre_approval_letter',
  PROOF_OF_FUNDS: 'proof_of_funds',
  LOAN_ESTIMATE: 'loan_estimate',
  CLOSING_DISCLOSURE: 'closing_disclosure',
  WIRE_INSTRUCTIONS: 'wire_instructions',
  COMMISSION_AGREEMENT: 'commission_agreement',

  // Property Documents
  PROPERTY_PHOTOS: 'property_photos',
  FLOOR_PLAN: 'floor_plan',
  APPRAISAL: 'appraisal',
  HOME_INSPECTION: 'home_inspection',
  SURVEY: 'survey',
  HOA_DOCUMENTS: 'hoa_documents',

  // Client Documents
  ID_VERIFICATION: 'id_verification',
  PROOF_OF_ADDRESS: 'proof_of_address',
  CLIENT_INTAKE_FORM: 'client_intake_form',

  // Templates
  TEMPLATE: 'template',

  // Other
  OTHER: 'other',
};

const DOCUMENT_CATEGORIES = {
  ESCROW: 'escrow',
  TRANSACTION: 'transaction',
  FINANCIAL: 'financial',
  PROPERTY: 'property',
  CLIENT: 'client',
  TEMPLATE: 'template',
  OTHER: 'other',
};

const ENTITY_TYPES = {
  ESCROW: 'escrow',
  LISTING: 'listing',
  CLIENT: 'client',
  APPOINTMENT: 'appointment',
  LEAD: 'lead',
  USER: 'user',
  TEAM: 'team',
};

const STORAGE_TYPES = {
  LOCAL: 'local',
  RAILWAY_VOLUME: 'railway_volume',
  AWS_S3: 'aws_s3',
  CLOUDFLARE_R2: 'cloudflare_r2',
};

const VISIBILITY_LEVELS = {
  PRIVATE: 'private',           // Only owner
  TEAM: 'team',                 // Owner's team
  SHARED: 'shared',             // Specific users/teams
  PUBLIC: 'public',             // All authenticated users
};

// Map document types to their categories
const TYPE_TO_CATEGORY = {
  [DOCUMENT_TYPES.ESCROW_OPENING]: DOCUMENT_CATEGORIES.ESCROW,
  [DOCUMENT_TYPES.ESCROW_INSTRUCTIONS]: DOCUMENT_CATEGORIES.ESCROW,
  [DOCUMENT_TYPES.PRELIMINARY_TITLE_REPORT]: DOCUMENT_CATEGORIES.ESCROW,
  [DOCUMENT_TYPES.FINAL_CLOSING_STATEMENT]: DOCUMENT_CATEGORIES.ESCROW,
  [DOCUMENT_TYPES.ESCROW_OTHER]: DOCUMENT_CATEGORIES.ESCROW,

  [DOCUMENT_TYPES.PURCHASE_AGREEMENT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.LISTING_AGREEMENT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.BUYER_REPRESENTATION]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.SHOWING_AGREEMENT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.REFERRAL_AGREEMENT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.DISCLOSURE_STATEMENT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.INSPECTION_REPORT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.AMENDMENT]: DOCUMENT_CATEGORIES.TRANSACTION,
  [DOCUMENT_TYPES.ADDENDUM]: DOCUMENT_CATEGORIES.TRANSACTION,

  [DOCUMENT_TYPES.PRE_APPROVAL_LETTER]: DOCUMENT_CATEGORIES.FINANCIAL,
  [DOCUMENT_TYPES.PROOF_OF_FUNDS]: DOCUMENT_CATEGORIES.FINANCIAL,
  [DOCUMENT_TYPES.LOAN_ESTIMATE]: DOCUMENT_CATEGORIES.FINANCIAL,
  [DOCUMENT_TYPES.CLOSING_DISCLOSURE]: DOCUMENT_CATEGORIES.FINANCIAL,
  [DOCUMENT_TYPES.WIRE_INSTRUCTIONS]: DOCUMENT_CATEGORIES.FINANCIAL,
  [DOCUMENT_TYPES.COMMISSION_AGREEMENT]: DOCUMENT_CATEGORIES.FINANCIAL,

  [DOCUMENT_TYPES.PROPERTY_PHOTOS]: DOCUMENT_CATEGORIES.PROPERTY,
  [DOCUMENT_TYPES.FLOOR_PLAN]: DOCUMENT_CATEGORIES.PROPERTY,
  [DOCUMENT_TYPES.APPRAISAL]: DOCUMENT_CATEGORIES.PROPERTY,
  [DOCUMENT_TYPES.HOME_INSPECTION]: DOCUMENT_CATEGORIES.PROPERTY,
  [DOCUMENT_TYPES.SURVEY]: DOCUMENT_CATEGORIES.PROPERTY,
  [DOCUMENT_TYPES.HOA_DOCUMENTS]: DOCUMENT_CATEGORIES.PROPERTY,

  [DOCUMENT_TYPES.ID_VERIFICATION]: DOCUMENT_CATEGORIES.CLIENT,
  [DOCUMENT_TYPES.PROOF_OF_ADDRESS]: DOCUMENT_CATEGORIES.CLIENT,
  [DOCUMENT_TYPES.CLIENT_INTAKE_FORM]: DOCUMENT_CATEGORIES.CLIENT,

  [DOCUMENT_TYPES.TEMPLATE]: DOCUMENT_CATEGORIES.TEMPLATE,
  [DOCUMENT_TYPES.OTHER]: DOCUMENT_CATEGORIES.OTHER,
};

// Allowed MIME types for each category
const ALLOWED_MIME_TYPES = {
  [DOCUMENT_CATEGORIES.ESCROW]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  [DOCUMENT_CATEGORIES.TRANSACTION]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  [DOCUMENT_CATEGORIES.FINANCIAL]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  [DOCUMENT_CATEGORIES.PROPERTY]: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  [DOCUMENT_CATEGORIES.CLIENT]: ['application/pdf', 'image/jpeg', 'image/png'],
  [DOCUMENT_CATEGORIES.TEMPLATE]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  [DOCUMENT_CATEGORIES.OTHER]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
};

module.exports = {
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  ENTITY_TYPES,
  STORAGE_TYPES,
  VISIBILITY_LEVELS,
  TYPE_TO_CATEGORY,
  ALLOWED_MIME_TYPES,
};
