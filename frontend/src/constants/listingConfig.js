import { alpha } from '@mui/material';

/**
 * Listing status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 */
export const LISTING_STATUS_CONFIG = {
  'Coming Soon': {
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#8b5cf6', 0.2)}`,
    icon: 'schedule',
    label: 'Coming Soon'
  },
  'Active': {
    color: '#10b981',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'trending_up',
    label: 'Active'
  },
  'Pending': {
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#f59e0b', 0.2)}`,
    icon: 'schedule',
    label: 'Pending'
  },
  'Sold': {
    color: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6366f1', 0.2)}`,
    icon: 'check_circle',
    label: 'Sold'
  },
  'Expired': {
    color: '#94a3b8',
    bg: 'linear-gradient(135deg, rgba(148,163,184,0.08) 0%, rgba(100,116,139,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#94a3b8', 0.2)}`,
    icon: 'schedule',
    label: 'Expired'
  },
  'Withdrawn': {
    color: '#64748b',
    bg: 'linear-gradient(135deg, rgba(100,116,139,0.08) 0%, rgba(71,85,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#64748b', 0.2)}`,
    icon: 'remove_circle',
    label: 'Withdrawn'
  },
  'Cancelled': {
    color: '#ef4444',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'cancel',
    label: 'Cancelled'
  },
  'Off Market': {
    color: '#64748b',
    bg: 'linear-gradient(135deg, rgba(100,116,139,0.08) 0%, rgba(71,85,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#64748b', 0.2)}`,
    icon: 'visibility_off',
    label: 'Off Market'
  }
};

/**
 * Get status config with fallback to Active
 * @param {string} status - Listing status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  return LISTING_STATUS_CONFIG[status] || LISTING_STATUS_CONFIG.Active;
};
