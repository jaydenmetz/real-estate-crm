/**
 * EscrowScopeFilter.jsx
 *
 * Scope filter configuration for escrows dashboard.
 * Generates scope options (Team/User) based on user role.
 *
 * Usage: Imported into escrows.config.js as getScopeOptions function
 */

export const getEscrowScopeOptions = (user) => {
  if (!user) {
    return [{ value: 'user', label: 'My Escrows' }];
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
    label: `${firstName}'s Escrows`,
    fullLabel: fullName
  });

  // Team owners and above can see team view
  if (['team_owner', 'broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'team',
      label: `${teamName}'s Escrows`,
      fullLabel: teamName
    });
  }

  // Brokers and system admins can see broker view
  if (['broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'broker',
      label: `${brokerName}'s Escrows`,
      fullLabel: brokerName
    });
  }

  return options;
};

export const escrowDefaultScope = 'user';
