/**
 * AppointmentScopeFilter.jsx
 *
 * Scope filter configuration for appointments dashboard.
 * Returns role-based filter options (user/team/broker views).
 *
 * Usage: Imported into appointments.config.js
 */

export const getAppointmentScopeOptions = (user) => {
  const firstName = user.firstName || user.first_name || 'My';
  const fullName = user.fullName || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'My';
  const teamName = user.teamName || user.team_name || 'Team';
  const userRole = user.role || 'agent';

  const options = [];

  // User scope (always available)
  options.push({
    value: 'user',
    label: `${firstName}'s Appointments`,
    fullLabel: fullName
  });

  // Team scope (for team_owner, broker, system_admin)
  if (['team_owner', 'broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'team',
      label: `${teamName}'s Appointments`,
      fullLabel: teamName
    });
  }

  // Broker scope (for broker and system_admin)
  if (['broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'broker',
      label: 'All Brokerage Appointments',
      fullLabel: 'Brokerage'
    });
  }

  // System scope (for system_admin only)
  if (userRole === 'system_admin') {
    options.push({
      value: 'all',
      label: 'All System Appointments',
      fullLabel: 'System'
    });
  }

  return options;
};

export const appointmentDefaultScope = 'user';
