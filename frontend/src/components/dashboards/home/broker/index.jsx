import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';

/**
 * BrokerHomeDashboard
 *
 * Home dashboard for broker role
 * Placeholder - will show brokerage-wide statistics
 */
const BrokerHomeDashboard = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Broker Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Brokerage-wide statistics and performance
              </Typography>
            </Box>
            <Chip
              label="BROKER"
              color="primary"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Broker Dashboard Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This dashboard will show brokerage-wide statistics including teams, agents, total volume, and performance metrics.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default BrokerHomeDashboard;
