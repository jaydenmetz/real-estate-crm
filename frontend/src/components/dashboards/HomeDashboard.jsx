import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SystemAdminHomeDashboard from './home/SystemAdminHomeDashboard';
import BrokerHomeDashboard from './home/BrokerHomeDashboard';
import TeamHomeDashboard from './home/TeamHomeDashboard';
import AgentHomeDashboard from './home/AgentHomeDashboard';

/**
 * HomeDashboard Component - Role-Based Router
 *
 * Routes users to appropriate home dashboard based on their role:
 * - system_admin → SystemAdminHomeDashboard (platform-wide stats)
 * - broker → BrokerHomeDashboard (brokerage-wide stats)
 * - team_owner → TeamHomeDashboard (team-wide stats)
 * - agent/user → AgentHomeDashboard (personal stats)
 *
 * All dashboards include date range filtering (1 day, 1 month, 1 year, YTD with year selector)
 */
const HomeDashboard = () => {
  const { user } = useAuth();

  // Route based on user role (highest priority first)
  if (user?.role === 'system_admin') {
    return <SystemAdminHomeDashboard />;
  }

  if (user?.role === 'broker') {
    return <BrokerHomeDashboard />;
  }

  if (user?.role === 'team_owner') {
    return <TeamHomeDashboard />;
  }

  // Default: agent/user dashboard
  return <AgentHomeDashboard />;
};

export default HomeDashboard;
