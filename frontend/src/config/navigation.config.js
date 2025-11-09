/**
 * Navigation Configuration
 *
 * Defines the order and metadata for dashboard navigation.
 * This allows folders to remain alphabetically organized while
 * controlling the display order in the UI.
 *
 * Industry Standard: Keep folders clean, control order in config.
 */

// Dashboard display order (matches navigation bar)
export const DASHBOARD_ORDER = [
  'home',
  'escrows',
  'clients',
  'appointments',
  'leads',
  'listings'
];

// Dashboard metadata (icons, labels, colors, routes)
export const DASHBOARD_METADATA = {
  home: {
    path: '/',
    icon: 'Home',
    label: 'Home',
    color: '#1976d2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Dashboard overview'
  },
  escrows: {
    path: '/escrows',
    icon: 'Gavel',
    label: 'Escrows',
    color: '#42a5f5',
    gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
    description: 'Manage escrow transactions'
  },
  clients: {
    path: '/clients',
    icon: 'People',
    label: 'Clients',
    color: '#66bb6a',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    description: 'Client relationship management'
  },
  appointments: {
    path: '/appointments',
    icon: 'Event',
    label: 'Appointments',
    color: '#ffa726',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Schedule and manage appointments'
  },
  leads: {
    path: '/leads',
    icon: 'TrendingUp',
    label: 'Leads',
    color: '#ab47bc',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Lead generation and tracking'
  },
  listings: {
    path: '/listings',
    icon: 'Business',
    label: 'Listings',
    color: '#ec407a',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: 'Property listings management'
  }
};

/**
 * Get ordered dashboard list
 * @returns {Array} Ordered array of dashboard configs
 */
export const getOrderedDashboards = () => {
  return DASHBOARD_ORDER.map(key => ({
    key,
    ...DASHBOARD_METADATA[key]
  }));
};

/**
 * Get dashboard metadata by key
 * @param {string} key - Dashboard key (e.g., 'escrows')
 * @returns {Object} Dashboard metadata
 */
export const getDashboardMetadata = (key) => {
  return DASHBOARD_METADATA[key] || null;
};

/**
 * Check if a dashboard exists
 * @param {string} key - Dashboard key
 * @returns {boolean}
 */
export const isDashboard = (key) => {
  return DASHBOARD_ORDER.includes(key);
};
