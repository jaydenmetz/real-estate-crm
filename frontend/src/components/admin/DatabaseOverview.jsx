import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  People,
  VpnKey,
  Security,
  Refresh,
  Description,
  Business,
  Assignment,
  Gavel,
  Domain,
  Contacts,
  EventNote,
  TrendingUp
} from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const DatabaseOverview = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      const response = await apiInstance.get('/admin/database-stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tableCards = [
    { name: 'Users', icon: People, color: '#1976d2', key: 'users' },
    { name: 'API Keys', icon: VpnKey, color: '#9c27b0', key: 'api_keys' },
    { name: 'Security Events', icon: Security, color: '#d32f2f', key: 'security_events' },
    { name: 'Refresh Tokens', icon: Refresh, color: '#388e3c', key: 'refresh_tokens' },
    { name: 'Audit Logs', icon: Description, color: '#f57c00', key: 'audit_logs' },
    { name: 'Escrows', icon: Gavel, color: '#0288d1', key: 'escrows' },
    { name: 'Listings', icon: Domain, color: '#43a047', key: 'listings' },
    { name: 'Clients', icon: Contacts, color: '#00acc1', key: 'clients' },
    { name: 'Appointments', icon: EventNote, color: '#ff6f00', key: 'appointments' },
    { name: 'Leads', icon: TrendingUp, color: '#7b1fa2', key: 'leads' },
    { name: 'Brokers', icon: Business, color: '#5d4037', key: 'brokers' },
    { name: 'Onboarding Progress', icon: Assignment, color: '#455a64', key: 'onboarding_progress' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {tableCards.map((table) => {
        const Icon = table.icon;
        const count = stats[table.key] || 0;

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={table.key}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${table.color} 0%, ${table.color}dd 100%)`,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Icon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {count.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {table.name}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DatabaseOverview;
