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
  TrendingUp,
  History,
  Group,
  Article,
  FileCopy,
  Folder,
  AttachMoney,
  ShowChart,
  Visibility,
  Route,
  AccountCircle,
  Groups
} from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const DatabaseOverview = ({ onTableClick }) => {
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
    // Core Authentication & Security (6 tables)
    { name: 'Users', icon: People, color: '#1976d2', key: 'users' },
    { name: 'User Profiles', icon: AccountCircle, color: '#42a5f5', key: 'user_profiles' },
    { name: 'API Keys', icon: VpnKey, color: '#9c27b0', key: 'api_keys' },
    { name: 'API Key Logs', icon: History, color: '#ab47bc', key: 'api_key_logs' },
    { name: 'Refresh Tokens', icon: Refresh, color: '#388e3c', key: 'refresh_tokens' },
    { name: 'Security Events', icon: Security, color: '#d32f2f', key: 'security_events' },

    // Audit & Logging (2 tables)
    { name: 'Audit Log', icon: Description, color: '#f57c00', key: 'audit_log' },
    { name: 'Audit Logs', icon: Description, color: '#ff9800', key: 'audit_logs' },

    // Core CRM Data (5 tables)
    { name: 'Escrows', icon: Gavel, color: '#0288d1', key: 'escrows' },
    { name: 'Listings', icon: Domain, color: '#43a047', key: 'listings' },
    { name: 'Clients', icon: Contacts, color: '#00acc1', key: 'clients' },
    { name: 'Appointments', icon: EventNote, color: '#ff6f00', key: 'appointments' },
    { name: 'Leads', icon: TrendingUp, color: '#7b1fa2', key: 'leads' },

    // Broker & Team Management (5 tables)
    { name: 'Brokers', icon: Business, color: '#5d4037', key: 'brokers' },
    { name: 'Broker Profiles', icon: AccountCircle, color: '#6d4c41', key: 'broker_profiles' },
    { name: 'Broker Teams', icon: Groups, color: '#795548', key: 'broker_teams' },
    { name: 'Broker Users', icon: Group, color: '#8d6e63', key: 'broker_users' },
    { name: 'Teams', icon: Groups, color: '#a1887f', key: 'teams' },

    // Listings Related (2 tables)
    { name: 'Listing Price History', icon: ShowChart, color: '#66bb6a', key: 'listing_price_history' },
    { name: 'Listing Showings', icon: Visibility, color: '#4caf50', key: 'listing_showings' },

    // Documents & Templates (3 tables)
    { name: 'Documents', icon: Article, color: '#1e88e5', key: 'documents' },
    { name: 'Document Templates', icon: FileCopy, color: '#42a5f5', key: 'document_templates' },
    { name: 'Generated Documents', icon: Folder, color: '#64b5f6', key: 'generated_documents' },

    // Misc (3 tables)
    { name: 'Contacts', icon: Contacts, color: '#26c6da', key: 'contacts' },
    { name: 'Onboarding Progress', icon: Assignment, color: '#455a64', key: 'onboarding_progress' },
    { name: 'Migrations', icon: Route, color: '#78909c', key: 'migrations' },
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
              onClick={() => onTableClick(table.key, table.name)}
              sx={{
                background: `linear-gradient(135deg, ${table.color} 0%, ${table.color}dd 100%)`,
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
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
