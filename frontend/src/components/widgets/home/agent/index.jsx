import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';

/**
 * AgentHomeDashboard
 *
 * Home dashboard for agent/user role
 * Placeholder - will show personal statistics
 */
const AgentHomeDashboard = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Agent Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your personal statistics and performance
              </Typography>
            </Box>
            <Chip
              label="AGENT"
              color="success"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Agent Dashboard Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This dashboard will show your personal statistics including active escrows, listings, clients, and performance metrics.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AgentHomeDashboard;
