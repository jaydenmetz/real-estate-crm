import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Activity, ChevronUp } from 'lucide-react';

// Floating tab at bottom of screen (Phase 4 will make it expand upward)
const FloatingTab = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: theme.spacing(2),
  borderTopRightRadius: theme.spacing(2),
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
  padding: theme.spacing(1.5, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 -6px 30px rgba(0, 0, 0, 0.2)',
    transform: 'translateX(-50%) translateY(-2px)',
  },
}));

const ActivityFeedBottomTab = ({ onClick }) => {
  return (
    <FloatingTab onClick={onClick}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Activity size={18} style={{ color: 'white' }} />
      </Box>
      <Typography variant="body2" fontWeight="600" color="text.primary">
        Activity Feed
      </Typography>
      <ChevronUp size={18} style={{ color: '#666' }} />
    </FloatingTab>
  );
};

export default ActivityFeedBottomTab;
