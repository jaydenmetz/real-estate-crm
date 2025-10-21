import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// White card with colored icon badge (auto-height to fit content)
const WhiteCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  minHeight: 300, // Minimum height for visual balance
  maxHeight: 400, // Maximum height to keep widgets balanced
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const IconBadge = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: theme.spacing(1.5),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const EventRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'start',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

const StatusDot = styled(Box)(({ status, theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  marginTop: 4,
  flexShrink: 0,
  backgroundColor:
    status === 'complete'
      ? theme.palette.success.main
      : status === 'today'
      ? theme.palette.primary.main
      : status === 'urgent'
      ? theme.palette.warning.main
      : theme.palette.grey[300],
  border: `2px solid ${
    status === 'complete'
      ? theme.palette.success.light
      : status === 'today'
      ? theme.palette.primary.light
      : status === 'urgent'
      ? theme.palette.warning.light
      : theme.palette.grey[100]
  }`,
  ...(status === 'today' && {
    animation: 'pulse 2s infinite',
  }),
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
}));

const TimelineWidget_White = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <WhiteCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={60} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={60} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={60} />
      </WhiteCard>
    );
  }

  // Get timeline from JSONB array
  const timeline = escrow?.timeline || [];
  const today = new Date();

  // Calculate days until/since
  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d ago`, status: 'complete' };
    if (diffDays === 0) return { text: 'Today', status: 'today' };
    if (diffDays <= 3) return { text: `In ${diffDays} days`, status: 'urgent' };
    return { text: `${diffDays} days`, status: 'upcoming' };
  };

  // Get upcoming events (show more to fill space)
  const upcomingEvents = timeline
    .filter(event => event.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show 5 events instead of 3

  const completedCount = timeline.filter(event => event.completed).length;
  const totalCount = timeline.length;

  const daysToClose = escrow?.details?.daysToClose || 0;

  return (
    <WhiteCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconBadge>
            <Activity size={18} style={{ color: 'white' }} />
          </IconBadge>
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            Timeline
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: '#EBF5FF',
            color: '#1976d2',
            padding: '4px 12px',
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {daysToClose > 0 ? `${daysToClose} days to close` : completedCount + '/' + totalCount}
        </Box>
      </Box>

      {/* Events - Scrollable Content */}
      <Box
        flex={1}
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'grey.300',
            borderRadius: 3,
          },
        }}
      >
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, idx) => {
            const daysInfo = getDaysUntil(event.date);

            return (
              <EventRow key={idx}>
                <StatusDot status={daysInfo?.status} />
                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="text.primary"
                    sx={{
                      opacity: daysInfo?.status === 'complete' ? 0.7 : 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.label}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                    {daysInfo && (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight="600"
                          sx={{
                            color:
                              daysInfo.status === 'complete'
                                ? 'success.main'
                                : daysInfo.status === 'today'
                                ? 'primary.main'
                                : daysInfo.status === 'urgent'
                                ? 'warning.main'
                                : 'text.secondary',
                          }}
                        >
                          {daysInfo.text}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </EventRow>
            );
          })
        ) : (
          <Box textAlign="center" py={4}>
            <Clock size={32} style={{ color: '#ccc', marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">
              No timeline events yet
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        mt={2}
        pt={2}
        borderTop={1}
        borderColor="divider"
        textAlign="center"
      >
        <Typography variant="caption" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
          Click to view full timeline →
        </Typography>
      </Box>
    </WhiteCard>
  );
};

export default TimelineWidget_White;
