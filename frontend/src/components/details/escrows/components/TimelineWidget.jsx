import React from 'react';
import { Box, Typography, Card, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, RadioButtonUnchecked, Schedule, ExpandMore } from '@mui/icons-material';
import { motion } from 'framer-motion';

// PHASE 4: Compact Timeline Widget (Vertical)
const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  maxHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const TimelineTrack = styled(Box)(({ theme}) => ({
  flex: 1,
  overflow: 'auto',
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: 4,
  },
}));

const MilestoneRow = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    left: 9,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: status === 'complete' ? theme.palette.success.light : theme.palette.grey[200],
  },
}));

const StatusIcon = styled(Box)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'complete':
        return theme.palette.success.main;
      case 'active':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[400];
    }
  };

  return {
    color: getColor(),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    flexShrink: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.paper,
  };
});

const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
  paddingTop: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 600,
}));

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to calculate days until/since
const getDaysUntil = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Today';
  return `${diffDays}d`;
};

const TimelineWidget = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <CompactCard>
        <Skeleton width="50%" height={24} sx={{ mb: 2 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} display="flex" gap={1.5} mb={2}>
            <Skeleton variant="circular" width={20} height={20} />
            <Box flex={1}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        ))}
      </CompactCard>
    );
  }

  // Extract timeline data (supports both formats)
  const timeline = escrow?.timeline || {};

  // Define 7 key milestones
  const milestones = [
    {
      id: 'acceptance',
      label: 'Offer Accepted',
      date: timeline.acceptanceDate,
      required: true,
    },
    {
      id: 'emd',
      label: 'EMD Deposited',
      date: timeline.emdDate,
      required: true,
    },
    {
      id: 'inspection',
      label: 'Home Inspection',
      date: timeline.homeInspectionDate,
      required: true,
    },
    {
      id: 'appraisal',
      label: 'Appraisal',
      date: timeline.appraisalDate,
      required: true,
    },
    {
      id: 'contingencies',
      label: 'Contingency Removal',
      date: timeline.allContingenciesRemovalDate || timeline.inspectionContingencyDate,
      required: true,
    },
    {
      id: 'finalWalkthrough',
      label: 'Final Walkthrough',
      date: null, // Not in typical timeline data
      required: false,
    },
    {
      id: 'coe',
      label: 'Close of Escrow',
      date: timeline.coeDate,
      required: true,
    },
  ];

  // Determine status for each milestone
  const today = new Date();
  const milestonesWithStatus = milestones.map((milestone) => {
    if (!milestone.date) {
      return { ...milestone, status: 'pending' };
    }

    const milestoneDate = new Date(milestone.date);
    if (milestoneDate < today) {
      return { ...milestone, status: 'complete' };
    } else {
      // Find if this is the next upcoming milestone
      const upcomingMilestones = milestones.filter(m => m.date && new Date(m.date) >= today);
      const nextMilestone = upcomingMilestones.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      return {
        ...milestone,
        status: milestone.id === nextMilestone?.id ? 'active' : 'pending',
      };
    }
  });

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      onClick={onClick}
    >
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
        Timeline & Deadlines
      </Typography>

      <TimelineTrack>
        {milestonesWithStatus.map((milestone) => (
          <MilestoneRow key={milestone.id} status={milestone.status}>
            <StatusIcon status={milestone.status}>
              {milestone.status === 'complete' && <CheckCircle fontSize="small" />}
              {milestone.status === 'active' && <Schedule fontSize="small" />}
              {milestone.status === 'pending' && <RadioButtonUnchecked fontSize="small" />}
            </StatusIcon>

            <Box flex={1}>
              <Typography
                variant="body2"
                fontWeight={milestone.status === 'active' ? 700 : 600}
                sx={{
                  color: milestone.status === 'complete'
                    ? 'success.main'
                    : milestone.status === 'active'
                    ? 'primary.main'
                    : 'text.primary',
                }}
              >
                {milestone.label}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(milestone.date)}
                </Typography>
                {milestone.date && getDaysUntil(milestone.date) && (
                  <>
                    <Typography variant="caption" color="text.secondary">•</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: milestone.status === 'active' ? 'primary.main' : 'text.secondary',
                        fontWeight: milestone.status === 'active' ? 700 : 400,
                      }}
                    >
                      {getDaysUntil(milestone.date)}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </MilestoneRow>
        ))}
      </TimelineTrack>

      <Footer>
        <Typography variant="caption" fontWeight="600">
          View All Dates
        </Typography>
        <ExpandMore sx={{ fontSize: '1rem' }} />
      </Footer>
    </CompactCard>
  );
};

export default TimelineWidget;
