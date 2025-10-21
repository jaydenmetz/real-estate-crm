import React from 'react';
import { Box, Typography, Card, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Schedule, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDate } from '../../../../utils/formatters';

// Ultra-simple card with no scrolling - shows only next 2-3 milestones
const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
}));

const MilestoneBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  marginBottom: theme.spacing(1.5),
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  flexShrink: 0,
}));

const TimelineWidget = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <CompactCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="100%" height={60} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
        <Skeleton width="100%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
      </CompactCard>
    );
  }

  const timeline = escrow?.timeline || {};
  const today = new Date();

  // Calculate days until/since
  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d ago`, isPast: true };
    if (diffDays === 0) return { text: 'Today', isToday: true };
    return { text: `${diffDays}d away`, isFuture: true };
  };

  // Get most important upcoming milestones (only show 2-3)
  const allMilestones = [
    { label: 'Home Inspection', date: timeline.homeInspectionDate, priority: 1 },
    { label: 'Appraisal', date: timeline.appraisalDate, priority: 2 },
    { label: 'Contingency Removal', date: timeline.allContingenciesRemovalDate || timeline.inspectionContingencyDate, priority: 3 },
    { label: 'Close of Escrow', date: timeline.coeDate || escrow.closing_date, priority: 4 },
  ].filter(m => m.date);

  // Sort by date and take next 2 upcoming + 1 past if available
  const sortedByDate = allMilestones.sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sortedByDate.filter(m => new Date(m.date) >= today).slice(0, 2);
  const recent = sortedByDate.filter(m => new Date(m.date) < today).slice(-1);

  const displayMilestones = [...recent, ...upcoming].slice(0, 3);

  // Count total milestones for summary
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => new Date(m.date) < today).length;

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography variant="h6" fontWeight="700" sx={{ color: 'white' }}>
          Timeline
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5} sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '4px 12px',
          borderRadius: 2
        }}>
          <CheckCircle sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight="700">
            {completedMilestones}/{totalMilestones}
          </Typography>
        </Box>
      </Box>

      {/* Key Milestones - Only 2-3 shown */}
      <Box flex={1}>
        {displayMilestones.map((milestone, index) => {
          const daysInfo = getDaysUntil(milestone.date);
          const isPast = daysInfo?.isPast;
          const isToday = daysInfo?.isToday;

          return (
            <MilestoneBox key={index}>
              <IconBox>
                {isPast ? (
                  <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
                ) : (
                  <Schedule sx={{ fontSize: 24, color: 'white' }} />
                )}
              </IconBox>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{
                    color: 'white',
                    opacity: isPast ? 0.7 : 1,
                  }}
                >
                  {milestone.label}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                    }}
                  >
                    {formatDate(milestone.date, 'MMM d, yyyy')}
                  </Typography>
                  {daysInfo && (
                    <>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        •
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight="700"
                        sx={{
                          color: isToday ? '#FCD34D' : 'rgba(255, 255, 255, 0.9)',
                        }}
                      >
                        {daysInfo.text}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </MilestoneBox>
          );
        })}
      </Box>

      {/* Footer - Click to expand */}
      <Box
        mt={2}
        pt={2}
        borderTop="1px solid rgba(255, 255, 255, 0.2)"
        textAlign="center"
      >
        <Typography variant="caption" fontWeight="600" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Click to view all {totalMilestones} milestones
        </Typography>
      </Box>
    </CompactCard>
  );
};

export default TimelineWidget;
