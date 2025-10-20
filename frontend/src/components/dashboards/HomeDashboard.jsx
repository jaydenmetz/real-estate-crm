import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ProjectRoadmapDashboard from '../common/ProjectRoadmapDashboard';

const HomeDashboard = () => {
  return (
    <Box sx={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8f9fa',
      py: 3
    }}>
      <Container maxWidth="xl">
        <Typography variant="h4">Testing - If you see this, React is working</Typography>
        <ProjectRoadmapDashboard />
      </Container>
    </Box>
  );
};

export default HomeDashboard;
