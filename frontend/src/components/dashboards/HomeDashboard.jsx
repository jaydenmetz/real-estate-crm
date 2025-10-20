import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ProjectManagementPanelLive from '../common/ProjectManagementPanelLive';

const HomeDashboard = () => {
  return (
    <Box sx={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8f9fa',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            CRM Development Roadmap
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Live data from production database - real-time project tracking
          </Typography>
        </Box>

        <ProjectManagementPanelLive />
      </Container>
    </Box>
  );
};

export default HomeDashboard;
