import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Tabs,
  Tab,
  Paper,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  VpnKey as ApiKeyIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Storage as DatabaseIcon,
  Description as AuditIcon,
  Business as BrokerIcon,
  Assignment as OnboardingIcon,
  Contacts as ContactsIcon,
  Domain as ListingsIcon,
  EventNote as AppointmentsIcon,
  TrendingUp as LeadsIcon,
  Gavel as EscrowsIcon,
  Description as DocumentsIcon,
  Folder as TemplatesIcon,
  Assessment as ReportsIcon
} from '@mui/icons-material';
import UsersTable from '../components/admin/UsersTable';
import ApiKeysTable from '../components/admin/ApiKeysTable';
import SecurityEventsTable from '../components/admin/SecurityEventsTable';
import RefreshTokensTable from '../components/admin/RefreshTokensTable';
import AuditLogsTable from '../components/admin/AuditLogsTable';
import DatabaseOverview from '../components/admin/DatabaseOverview';
import TableDataViewer from '../components/admin/TableDataViewer';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableName, setSelectedTableName] = useState(null);

  const handleTableClick = (tableKey, tableName) => {
    setSelectedTable(tableKey);
    setSelectedTableName(tableName);
  };

  const handleBackToOverview = () => {
    setSelectedTable(null);
    setSelectedTableName(null);
  };

  const tables = [
    { name: 'Overview', icon: <DatabaseIcon />, component: DatabaseOverview },
    { name: 'Users', icon: <PeopleIcon />, component: UsersTable },
    { name: 'API Keys', icon: <ApiKeyIcon />, component: ApiKeysTable },
    { name: 'Security Events', icon: <SecurityIcon />, component: SecurityEventsTable },
    { name: 'Refresh Tokens', icon: <RefreshIcon />, component: RefreshTokensTable },
    { name: 'Audit Logs', icon: <AuditIcon />, component: AuditLogsTable },
  ];

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Admin Panel
              </Typography>
              <Typography variant="body1" color="textSecondary">
                System administration and database management
              </Typography>
            </Box>
            <Chip
              label="ADMIN ONLY"
              color="error"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            {tables.map((table, index) => (
              <Tab
                key={table.name}
                icon={table.icon}
                label={table.name}
                iconPosition="start"
              />
            ))}
          </Tabs>

          {tables.map((table, index) => (
            <TabPanel key={table.name} value={activeTab} index={index}>
              {table.name === 'Overview' && selectedTable ? (
                <TableDataViewer
                  tableName={selectedTable}
                  displayName={selectedTableName}
                  onBack={handleBackToOverview}
                />
              ) : table.name === 'Overview' ? (
                <DatabaseOverview onTableClick={handleTableClick} />
              ) : (
                <table.component />
              )}
            </TabPanel>
          ))}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPanel;
