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
  Groups,
  Assessment,
  Notifications,
  Flag,
  PersonAdd,
  Public,
  Lock,
  SupervisedUserCircle,
  Work,
  CheckCircle,
  Timer,
  Comment,
  Schedule,
  AccountTree,
  AdminPanelSettings
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
      // apiInstance already unwraps the response, so response = { success: true, data: { table_name: count } }
      console.log('Database stats response:', response);
      if (response?.data) {
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
    { name: 'User Roles', icon: AdminPanelSettings, color: '#5c6bc0', key: 'user_roles' },
    { name: 'User Permissions', icon: Lock, color: '#7e57c2', key: 'user_permissions' },
    { name: 'API Keys', icon: VpnKey, color: '#9c27b0', key: 'api_keys' },
    { name: 'API Key Logs', icon: History, color: '#ab47bc', key: 'api_key_logs' },
    { name: 'Refresh Tokens', icon: Refresh, color: '#388e3c', key: 'refresh_tokens' },
    { name: 'Security Events', icon: Security, color: '#d32f2f', key: 'security_events' },

    // Roles & Access Control (4 tables)
    { name: 'Roles', icon: SupervisedUserCircle, color: '#303f9f', key: 'roles' },
    { name: 'Role History', icon: History, color: '#3949ab', key: 'role_history' },
    { name: 'Data Access Control', icon: Lock, color: '#3f51b5', key: 'data_access_control' },

    // Audit & Logging (2 tables)
    { name: 'Audit Log', icon: Description, color: '#f57c00', key: 'audit_log' },
    { name: 'Audit Logs', icon: Description, color: '#ff9800', key: 'audit_logs' },

    // Core CRM Data (5 tables)
    { name: 'Escrows', icon: Gavel, color: '#0288d1', key: 'escrows' },
    { name: 'Escrow People', icon: PersonAdd, color: '#039be5', key: 'escrow_people' },
    { name: 'Listings', icon: Domain, color: '#43a047', key: 'listings' },
    { name: 'Clients', icon: Contacts, color: '#00acc1', key: 'clients' },
    { name: 'Appointments', icon: EventNote, color: '#ff6f00', key: 'appointments' },
    { name: 'Leads', icon: TrendingUp, color: '#7b1fa2', key: 'leads' },

    // Broker & Team Management (7 tables)
    { name: 'Brokerages', icon: Business, color: '#5d4037', key: 'brokerages' },
    { name: 'Broker Profiles', icon: AccountCircle, color: '#6d4c41', key: 'broker_profiles' },
    { name: 'Broker Teams', icon: Groups, color: '#795548', key: 'broker_teams' },
    { name: 'Broker Users', icon: Group, color: '#8d6e63', key: 'broker_users' },
    { name: 'Broker History', icon: History, color: '#a1887f', key: 'broker_history' },
    { name: 'Broker Notifications', icon: Notifications, color: '#bcaaa4', key: 'broker_notification_settings' },
    { name: 'Teams', icon: Groups, color: '#d7ccc8', key: 'teams' },

    // Agent KPIs & Goals (2 tables)
    { name: 'Agent KPIs', icon: Assessment, color: '#2e7d32', key: 'agent_kpis' },
    { name: 'Goals', icon: Flag, color: '#388e3c', key: 'goals' },

    // Listings Related (2 tables)
    { name: 'Listing Price History', icon: ShowChart, color: '#66bb6a', key: 'listing_price_history' },
    { name: 'Listing Showings', icon: Visibility, color: '#4caf50', key: 'listing_showings' },

    // Documents & Templates (3 tables)
    { name: 'Documents', icon: Article, color: '#1e88e5', key: 'documents' },
    { name: 'Document Templates', icon: FileCopy, color: '#42a5f5', key: 'document_templates' },
    { name: 'Generated Documents', icon: Folder, color: '#64b5f6', key: 'generated_documents' },

    // Contacts & Contact Roles (6 tables)
    { name: 'Contacts', icon: Contacts, color: '#26c6da', key: 'contacts' },
    { name: 'Contact Roles', icon: Work, color: '#00acc1', key: 'contact_roles' },
    { name: 'Contact Role Assignments', icon: Assignment, color: '#0097a7', key: 'contact_role_assignments' },
    { name: 'Contact Validation Prefs', icon: CheckCircle, color: '#00838f', key: 'contact_validation_preferences' },
    { name: 'Contacts (All Roles)', icon: Public, color: '#006064', key: 'contacts_with_all_roles' },
    { name: 'Contacts (Primary Role)', icon: AccountCircle, color: '#00bcd4', key: 'contacts_with_primary_role' },

    // Tasks & Checklists (6 tables)
    { name: 'Tasks', icon: Assignment, color: '#c62828', key: 'tasks' },
    { name: 'Task Activity', icon: History, color: '#d32f2f', key: 'task_activity' },
    { name: 'Task Comments', icon: Comment, color: '#e53935', key: 'task_comments' },
    { name: 'Checklists', icon: CheckCircle, color: '#f44336', key: 'checklists' },
    { name: 'Checklist Templates', icon: FileCopy, color: '#ef5350', key: 'checklist_templates' },
    { name: 'Projects', icon: AccountTree, color: '#e57373', key: 'projects' },

    // System & Misc (3 tables)
    { name: 'Onboarding Progress', icon: Schedule, color: '#455a64', key: 'onboarding_progress' },
    { name: 'Timezones', icon: Public, color: '#607d8b', key: 'timezones' },
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
