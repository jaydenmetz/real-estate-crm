import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const FeedContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(3),
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

const FeedHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
});

const FilterButton = styled(Button)({
  fontSize: '0.75rem',
  padding: '4px 12px',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  borderRadius: 9999,
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#e5e7eb',
  },
});

const ActivityItem = styled(Box)({
  display: 'flex',
  gap: 16,
  paddingBottom: 16,
  borderBottom: '1px solid #f3f4f6',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const ActivityIcon = styled(Box)(({ color }) => {
  const getBackgroundColor = () => {
    switch (color) {
      case 'blue':
        return '#dbeafe';
      case 'purple':
        return '#e9d5ff';
      case 'green':
        return '#d1fae5';
      case 'orange':
        return '#fed7aa';
      default:
        return '#f3f4f6';
    }
  };

  return {
    width: 40,
    height: 40,
    backgroundColor: getBackgroundColor(),
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    fontSize: '1.125rem',
  };
});

/**
 * ActivityFeed - Shows timeline of all actions and updates
 *
 * Features:
 * - Timeline of all escrow activities
 * - User avatars and icons
 * - Timestamps
 * - Filter and Export buttons
 * - Load More functionality
 */
const ActivityFeed = ({ activities = [] }) => {
  // Default activities if none provided
  const defaultActivities = [
    {
      time: '2 hours ago',
      user: 'Jayden Metz',
      action: 'opened this escrow',
      color: 'blue',
      icon: '🎉',
    },
    {
      time: 'Yesterday',
      user: 'System',
      action: 'scheduled home inspection for Oct 20',
      color: 'purple',
      icon: '📅',
    },
    {
      time: '2 days ago',
      user: 'System',
      action: 'received earnest money deposit of $5,000',
      color: 'green',
      icon: '💰',
    },
    {
      time: '2 days ago',
      user: 'You',
      action: 'uploaded purchase agreement',
      color: 'orange',
      icon: '📄',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <FeedContainer>
      <FeedHeader>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Activity Feed
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterButton>Filter</FilterButton>
          <FilterButton>Export</FilterButton>
        </Box>
      </FeedHeader>

      <Box display="flex" flexDirection="column" gap={2}>
        {displayActivities.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActivityItem>
              <ActivityIcon color={item.color}>
                <span>{item.icon}</span>
              </ActivityIcon>
              <Box flex={1}>
                <Typography variant="body2" color="text.primary">
                  <Box component="span" fontWeight={600}>
                    {item.user}
                  </Box>{' '}
                  {item.action}
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  {item.time}
                </Typography>
              </Box>
            </ActivityItem>
          </motion.div>
        ))}
      </Box>

      <Button
        fullWidth
        sx={{
          mt: 2,
          color: 'primary.main',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
          },
        }}
      >
        Load More Activity
      </Button>
    </FeedContainer>
  );
};

export default ActivityFeed;
