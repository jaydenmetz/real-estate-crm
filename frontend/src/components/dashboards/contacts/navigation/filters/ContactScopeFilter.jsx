/**
 * Contact Scope Filter Configuration
 *
 * Defines the scope filtering options for contacts.
 */

export const getContactScopeOptions = (user) => {
  const options = [
    { value: 'all', label: 'All Contacts' },
    { value: 'mine', label: 'My Contacts' },
  ];

  // Add team option for admin/broker users
  if (user?.role === 'system_admin' || user?.role === 'broker' || user?.role === 'team_lead') {
    options.push({ value: 'team', label: 'Team Contacts' });
  }

  return options;
};

export const contactDefaultScope = 'all';
