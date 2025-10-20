import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
} from '@mui/material';

const ProjectRoadmapDashboard = () => {
  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Development Roadmap
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your project management dashboard - Ready for you to add projects
        </Typography>
      </Paper>

      {/* Empty State */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          No Projects Yet
        </Typography>
        <Typography variant="body2">
          This dashboard is ready for you to add your development projects. Each project can include:
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 0 }}>
          <li>Priority levels (Critical, High, Medium, Low)</li>
          <li>Progress tracking (percentage and task counts)</li>
          <li>Comprehensive AI prompts for implementation</li>
          <li>User action checklists</li>
          <li>Copy-to-clipboard functionality</li>
        </Box>
      </Alert>
    </Box>
  );
};

export default ProjectRoadmapDashboard;
