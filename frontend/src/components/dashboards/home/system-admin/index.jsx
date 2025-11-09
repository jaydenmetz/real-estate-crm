import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import DatabaseOverview from '../../../admin/DatabaseOverview';
import TableDataViewer from '../../../admin/TableDataViewer';

/**
 * SystemAdminHomeDashboard
 *
 * Admin Panel for system_admin role - Database management and system administration
 * This is the home dashboard that system admins see when they log in
 */
const SystemAdminHomeDashboard = () => {
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

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
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

          {selectedTable ? (
            <TableDataViewer
              tableName={selectedTable}
              displayName={selectedTableName}
              onBack={handleBackToOverview}
            />
          ) : (
            <DatabaseOverview onTableClick={handleTableClick} />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default SystemAdminHomeDashboard;
