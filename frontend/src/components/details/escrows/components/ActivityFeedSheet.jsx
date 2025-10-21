import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  DollarSign,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Clock
} from 'lucide-react';

// Semi-transparent overlay
const Overlay = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  top: 64, // Below navbar
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 999,
  backdropFilter: 'blur(2px)',
}));

// Activity feed sheet that expands upward
const Sheet = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: 800,
  maxHeight: '70vh',
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: theme.spacing(3),
  borderTopRightRadius: theme.spacing(3),
  boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const SheetHandle = styled(Box)(({ theme }) => ({
  width: 48,
  height: 4,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 2,
  margin: `${theme.spacing(1.5)} auto ${theme.spacing(2)}`,
  cursor: 'pointer',
}));

const SheetHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

const ActivityList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 4,
  },
}));

const ActivityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
}));

const IconBadge = styled(Box)(({ color }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  background: color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const getIconForActivityType = (type) => {
  const icons = {
    timeline: <CheckCircle size={20} style={{ color: 'white' }} />,
    financial: <DollarSign size={20} style={{ color: 'white' }} />,
    people: <Users size={20} style={{ color: 'white' }} />,
    document: <FileText size={20} style={{ color: 'white' }} />,
    appointment: <Calendar size={20} style={{ color: 'white' }} />,
    note: <MessageSquare size={20} style={{ color: 'white' }} />,
    default: <Activity size={20} style={{ color: 'white' }} />,
  };
  return icons[type] || icons.default;
};

const getColorForActivityType = (type) => {
  const colors = {
    timeline: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)', // Blue
    financial: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Green
    people: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Purple/Pink
    document: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', // Orange
    appointment: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', // Pink
    note: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', // Purple
  };
  return colors[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

const getTimeAgo = (date) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffMs = now - activityDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActivityFeedSheet = ({ open, onClose, escrow }) => {
  // Mock activity data (in production, this would come from API)
  const activities = [
    {
      id: 1,
      type: 'timeline',
      title: 'EMD Deposited',
      description: 'Earnest money deposit of $5,000 has been received by escrow',
      user: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      id: 2,
      type: 'financial',
      title: 'Commission Updated',
      description: 'Your commission has been updated to $11,400',
      user: 'Josh Riley',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 3,
      type: 'people',
      title: 'New Contact Added',
      description: 'Loan officer Michael Chen was added to the transaction',
      user: 'Jayden Metz',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      id: 4,
      type: 'document',
      title: 'Purchase Agreement Signed',
      description: 'All parties have signed the purchase agreement',
      user: 'DocuSign',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Inspection Scheduled',
      description: 'Home inspection scheduled for Nov 5, 2025 at 10:00 AM',
      user: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
    {
      id: 6,
      type: 'note',
      title: 'Note Added',
      description: 'Buyers are pre-approved up to $700K. Looking to close quickly.',
      user: 'Jayden Metz',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      id: 7,
      type: 'timeline',
      title: 'Acceptance Date Set',
      description: 'Offer accepted on Sep 14, 2025',
      user: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 36), // 36 days ago
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Semi-transparent overlay */}
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Activity feed sheet */}
          <Sheet
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <SheetHandle onClick={onClose} />

            <SheetHeader>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={20} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="700">
                    Activity Feed
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {activities.length} recent activities
                  </Typography>
                </Box>
              </Box>
            </SheetHeader>

            <ActivityList>
              {activities.map((activity) => (
                <ActivityItem key={activity.id}>
                  <IconBadge color={getColorForActivityType(activity.type)}>
                    {getIconForActivityType(activity.type)}
                  </IconBadge>

                  <Box flex={1} minWidth={0}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={0.5}>
                      <Typography variant="body1" fontWeight="700" color="text.primary">
                        {activity.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} flexShrink={0} ml={1}>
                        <Clock size={14} style={{ color: '#9e9e9e' }} />
                        <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                          {getTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, lineHeight: 1.5 }}
                    >
                      {activity.description}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          fontSize: '0.625rem',
                          bgcolor: '#4A90E2',
                        }}
                      >
                        {activity.user.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        {activity.user}
                      </Typography>
                    </Box>
                  </Box>
                </ActivityItem>
              ))}

              {/* End of feed message */}
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary">
                  That's all the activity for this escrow
                </Typography>
              </Box>
            </ActivityList>
          </Sheet>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityFeedSheet;
