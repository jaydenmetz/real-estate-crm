import React, { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import apiInstance from '../../services/api.service';
import BrokerHeroCard from './home/BrokerHeroCard';
import TeamSelector from '../admin/TeamSelector';
import TeamHeroCard from './home/TeamHeroCard';
import UserHeroCard from './home/UserHeroCard';

/**
 * HomeDashboard Component
 *
 * PHASE 3: Multi-Tenant Admin System - Hierarchical Dashboard
 *
 * Displays role-based hierarchical dashboards:
 * - Broker: Broker Dashboard → Team Selector → Team Dashboard → User Dashboard
 * - Team Owner: Team Dashboard → User Dashboard
 * - Agent: User Dashboard only
 *
 * All sections auto-show based on role (no separate Admin menu)
 */
const HomeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine user's role and permissions
  const isBroker = user?.role === 'broker' || user?.role === 'system_admin';
  const isTeamOwner = user?.role === 'team_owner' || isBroker;
  const brokerId = user?.broker_id;

  // Fetch all stats from single endpoint (role-based response)
  useEffect(() => {
    const fetchHomeStats = async () => {
      try {
        setLoading(true);

        // Build query string
        const params = new URLSearchParams();
        if (selectedTeamId) {
          params.append('teamId', selectedTeamId);
        }

        const queryString = params.toString();
        const url = `/stats/home${queryString ? `?${queryString}` : ''}`;

        const response = await apiInstance.get(url);

        if (response.success) {
          setStats(response.data);
        } else {
          console.error('API returned error:', response.error);
          setStats(null); // Explicitly set to null to show error page
        }
      } catch (error) {
        console.error('Error fetching home stats:', error);
        setStats(null); // Explicitly set to null to show error page
      } finally {
        setLoading(false);
      }
    };

    fetchHomeStats();
  }, [selectedTeamId]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f8f9fa',
        py: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary">
              Loading your dashboard...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  // Show error state if no stats loaded
  if (!loading && !stats) {
    return (
      <Box sx={{
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f8f9fa',
        py: 3
      }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Unable to load dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              The API call to /stats/home failed or returned an error.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check the browser console for detailed error messages.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8f9fa',
      py: 3
    }}>
      <Container maxWidth="xl">
        {/* TIER 1: Broker Dashboard (broker/system_admin only) */}
        {isBroker && stats?.broker && (
          <BrokerHeroCard stats={stats.broker} loading={loading} />
        )}

        {/* Team Selector (broker only - switches between teams) */}
        {isBroker && (
          <TeamSelector
            selectedTeamId={selectedTeamId}
            onTeamChange={setSelectedTeamId}
            brokerId={brokerId}
          />
        )}

        {/* TIER 2: Team Dashboard (team_owner/broker) */}
        {isTeamOwner && stats?.team && (
          <TeamHeroCard stats={stats.team} loading={loading} />
        )}

        {/* TIER 3: User Dashboard (all users) */}
        {stats?.user && (
          <UserHeroCard stats={stats.user} loading={loading} />
        )}
      </Container>
    </Box>
  );
};

export default HomeDashboard;
