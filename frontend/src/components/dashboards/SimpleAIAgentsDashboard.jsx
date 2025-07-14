import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SimpleAIAgentsDashboard = () => {
  console.log('SimpleAIAgentsDashboard rendering');
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          AI Team Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your AI agents, chat with them directly, and view their activity logs
        </Typography>
      </Box>
      
      <Typography>
        If you can see this text, the dashboard is loading correctly!
      </Typography>
    </Container>
  );
};

export default SimpleAIAgentsDashboard;