/**
 * ListingScopeFilter.jsx
 *
 * Scope filter configuration for listings dashboard.
 * Generates scope options (Team/User) based on user role.
 *
 * Uses templatized scope logic from utils/scopeFilterUtils.js
 *
 * Usage: Imported into listings.config.js as getScopeOptions function
 */

export const getListingScopeOptions = (user) => {
  if (!user) {
    return [{ value: 'user', label: 'My Listings' }];
  }

  // Handle both camelCase and snake_case from backend
  const firstName = user.firstName || user.first_name || 'My';
  const lastName = user.lastName || user.last_name || '';
  const fullName = lastName ? `${firstName} ${lastName}` : (user.username || firstName);
  const teamName = user.teamName || user.team_name || 'Team';
  const brokerName = user.brokerName || user.broker_name || 'Broker';
  const userRole = user.role || 'agent';

  const options = [];

  // All users can see their own records
  options.push({
    value: 'user',
    label: `${firstName}'s Listings`,
    fullLabel: fullName
  });

  // Team owners and above can see team view
  if (['team_owner', 'broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'team',
      label: `${teamName}'s Listings`,
      fullLabel: teamName
    });
  }

  // Brokers and system admins can see broker view
  if (['broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'broker',
      label: `${brokerName}'s Listings`,
      fullLabel: brokerName
    });
  }

  return options;
};

export const listingDefaultScope = 'user';
