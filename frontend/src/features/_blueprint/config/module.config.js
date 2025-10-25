/**
 * MODULE_NAME Module Configuration Template
 *
 * This configuration file is used by the module generator to create new feature modules.
 * All MODULE_* placeholders will be automatically replaced during generation.
 *
 * Placeholder Mappings:
 * - MODULE_NAME: PascalCase name (e.g., OpenHouses)
 * - MODULE_SINGULAR: camelCase singular (e.g., openHouse)
 * - MODULE_PLURAL: camelCase plural (e.g., openHouses)
 * - MODULE_KEBAB: kebab-case for URLs (e.g., open-houses)
 * - MODULE_UPPER: UPPER_CASE for constants (e.g., OPEN_HOUSES)
 * - MODULE_TITLE: Title Case for display (e.g., Open Houses)
 */

export const MODULE_CONFIG = {
  // Module metadata
  module: {
    name: 'MODULE_NAME',
    singular: 'MODULE_SINGULAR',
    plural: 'MODULE_PLURAL',
    kebab: 'MODULE_KEBAB',
    title: 'MODULE_TITLE',
    description: 'Manage your MODULE_PLURAL',
    icon: 'Home',
    color: 'primary',
    version: '1.0.0'
  },

  // API configuration
  api: {
    baseUrl: '/v1/MODULE_PLURAL',
    timeout: 30000,
    retries: 3
  },

  // Dashboard statistics
  stats: [
    {
      id: 'total',
      label: 'Total MODULE_TITLE',
      field: 'totalCount',
      format: 'number',
      icon: 'FormatListNumbered',
      color: 'primary'
    },
    {
      id: 'active',
      label: 'Active',
      field: 'activeCount',
      format: 'number',
      icon: 'CheckCircle',
      color: 'success',
      clickable: true
    }
  ],

  // View modes
  viewModes: {
    default: 'grid',
    available: ['grid', 'list']
  },

  // Features
  features: {
    realtime: true,
    export: true,
    bulkOperations: true
  }
};

export default MODULE_CONFIG;
