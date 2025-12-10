/**
 * Contact Status Tabs Configuration
 *
 * Defines the status tabs for the contacts dashboard.
 * Contacts use role-based filtering rather than workflow status.
 */

export const contactStatusTabs = [
  {
    value: 'all',
    label: 'All Contacts',
    categoryKey: 'all',
  },
  {
    value: 'sphere',
    label: 'Sphere',
    categoryKey: 'sphere',
  },
  {
    value: 'lead',
    label: 'Leads',
    categoryKey: 'lead',
  },
  {
    value: 'client',
    label: 'Clients',
    categoryKey: 'client',
  },
];
