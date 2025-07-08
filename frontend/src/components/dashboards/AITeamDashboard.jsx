import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const AITeamDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        AI Team Dashboard
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Agents
          </Typography>
          <Typography color="text.secondary">
            AI team management interface coming soon...
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AITeamDashboard;