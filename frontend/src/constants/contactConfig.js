import { alpha } from '@mui/material';

/**
 * Contact role configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Contacts use role-based filtering rather than workflow status:
 * - sphere (purple) - All contacts in your sphere of influence
 * - lead (blue) - Potential clients being nurtured
 * - client (green) - Active or past clients
 */
export const CONTACT_ROLE_CONFIG = {
  'sphere': {
    color: '#8B5CF6',
    bg: '#8B5CF6',
    cardBg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#8B5CF6', 0.2)}`,
    icon: 'people',
    label: 'Sphere',
    category: 'sphere'
  },
  'lead': {
    color: '#3b82f6',
    bg: '#3b82f6',
    cardBg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'person_add',
    label: 'Lead',
    category: 'lead'
  },
  'client': {
    color: '#10b981',
    bg: '#10b981',
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'verified_user',
    label: 'Client',
    category: 'client'
  }
};

/**
 * Role color mapping for MUI chip variants
 * Maps role keys to MUI color names
 */
export const CONTACT_ROLE_COLORS = {
  'sphere': 'secondary',
  'lead': 'info',
  'client': 'success'
};

/**
 * Role labels for display
 */
export const CONTACT_ROLE_LABELS = {
  'sphere': 'Sphere',
  'lead': 'Lead',
  'client': 'Client'
};

/**
 * All valid contact roles (lowercase keys)
 */
export const CONTACT_ROLE = {
  SPHERE: 'sphere',
  LEAD: 'lead',
  CLIENT: 'client'
};

/**
 * Get role config with fallback to sphere
 * Case-insensitive lookup - normalizes to lowercase
 * @param {string} role - Contact role
 * @returns {object} Role configuration
 */
export const getContactRoleConfig = (role) => {
  if (!role) return CONTACT_ROLE_CONFIG.sphere;

  // Normalize role to lowercase for consistent lookup
  const normalized = role.toLowerCase();

  return CONTACT_ROLE_CONFIG[normalized] || CONTACT_ROLE_CONFIG.sphere;
};

/**
 * Get contact role config (alias for getContactRoleConfig)
 * Provides consistent naming across all entity configs
 */
export const getStatusConfig = getContactRoleConfig;
export const getRoleConfig = getContactRoleConfig;

/**
 * Contact source options
 */
export const CONTACT_SOURCE = {
  REFERRAL: 'referral',
  WEBSITE: 'website',
  SOCIAL_MEDIA: 'social_media',
  OPEN_HOUSE: 'open_house',
  COLD_CALL: 'cold_call',
  NETWORKING: 'networking',
  PAST_CLIENT: 'past_client',
  OTHER: 'other'
};

export const CONTACT_SOURCE_LABELS = {
  'referral': 'Referral',
  'website': 'Website',
  'social_media': 'Social Media',
  'open_house': 'Open House',
  'cold_call': 'Cold Call',
  'networking': 'Networking',
  'past_client': 'Past Client',
  'other': 'Other'
};

/**
 * Contact communication preferences
 */
export const CONTACT_COMM_PREFERENCE = {
  EMAIL: 'email',
  PHONE: 'phone',
  TEXT: 'text',
  ANY: 'any'
};

export const CONTACT_COMM_LABELS = {
  'email': 'Email',
  'phone': 'Phone Call',
  'text': 'Text Message',
  'any': 'Any'
};
