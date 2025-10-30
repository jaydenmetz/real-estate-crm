import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { styled } from '@mui/material/styles';

const ActivityFeedContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})(({ theme, isOpen }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: isOpen ? '50vh' : 56,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'height 0.3s ease-in-out',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
}));

const ActivityFeedTab = styled(Box)(({ theme }) => ({
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  transition: 'background-color 0.2s',
}));

const ActivityFeedContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(3),
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 4,
  },
}));

const ConnectionBadge = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1.5),
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.dark,
  fontSize: '0.75rem',
  fontWeight: 600,
  borderRadius: theme.spacing(2),
  boxShadow: 'none',
  '&::before': {
    content: '""',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
}));

/**
 * DetailActivityFeed Component
 *
 * Expandable bottom tab showing live activity feed
 * Matches escrows design with connection status badge
 */
export const DetailActivityFeed = ({ entity, config, isOpen, onToggle }) => {
  if (!config) return null;

  return (
    <ActivityFeedContainer isOpen={isOpen}>
      <ActivityFeedTab onClick={onToggle}>
        <Activity size={20} />
        <Typography variant="subtitle2" fontWeight={700}>
          Activity Feed
        </Typography>
        <IconButton size="small" sx={{ ml: 'auto', mr: 2, color: 'white' }}>
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </IconButton>

        {/* Connection Status Badge */}
        <ConnectionBadge elevation={0}>
          Connected
        </ConnectionBadge>
      </ActivityFeedTab>

      {isOpen && (
        <ActivityFeedContent>
          {config.component ? (
            React.createElement(config.component, { entity, config })
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              Activity feed - Coming Soon
            </Typography>
          )}
        </ActivityFeedContent>
      )}
    </ActivityFeedContainer>
  );
};
