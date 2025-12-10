import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import SystemAdminHomeDashboard from './system-admin';
import BrokerHomeDashboard from './broker';
import TeamHomeDashboard from './team';
import AgentHomeDashboard from './agent';

/**
 * HomeDashboard Component - Role-Based Router
 *
 * Routes users to appropriate home dashboard based on their role:
 * - system_admin → SystemAdminHomeDashboard (Admin Panel with database management)
 * - broker → BrokerHomeDashboard (brokerage-wide stats)
 * - team_owner → TeamHomeDashboard (team-wide stats)
 * - agent/user → AgentHomeDashboard (personal stats)
 *
 * NOTE: user.role can be either a string or an array of roles
 * We check for highest priority role first (system_admin > broker > team_owner > agent)
 */
const HomeDashboard = () => {
  const { user } = useAuth();

  // Helper function to check if user has a specific role
  const hasRole = (roleName) => {
    if (!user?.role) return false;
    // Handle both string and array formats
    if (Array.isArray(user.role)) {
      return user.role.includes(roleName);
    }
    return user.role === roleName;
  };

  // Route based on user role (highest priority first)
  // System admin gets admin panel regardless of other roles
  if (hasRole('system_admin')) {
    return <SystemAdminHomeDashboard />;
  }

  if (hasRole('broker')) {
    return <BrokerHomeDashboard />;
  }

  if (hasRole('team_owner')) {
    return <TeamHomeDashboard />;
  }

  // Default: agent/user dashboard
  return <AgentHomeDashboard />;
};

export default HomeDashboard;
