import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ProjectManagementPanel from '../common/ProjectManagementPanel';

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
            Your complete project management system - all work organized, tracked, and prioritized
          </Typography>
        </Box>

        <ProjectManagementPanel />
      </Container>
    </Box>
  );
};

export default HomeDashboard;
