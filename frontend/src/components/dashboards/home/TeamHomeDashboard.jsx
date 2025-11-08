import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';

/**
 * TeamHomeDashboard
 *
 * Home dashboard for team_owner role
 * Placeholder - will show team-wide statistics
 */
const TeamHomeDashboard = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Team Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your team's statistics and performance
              </Typography>
            </Box>
            <Chip
              label="TEAM OWNER"
              color="secondary"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Team Dashboard Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This dashboard will show team-wide statistics including members, active deals, team volume, and performance metrics.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TeamHomeDashboard;
