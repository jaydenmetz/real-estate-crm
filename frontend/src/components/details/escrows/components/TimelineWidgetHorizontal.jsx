import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Warning,
  CalendarToday,
  Flag,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

const HorizontalContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white',
  marginBottom: theme.spacing(3)
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(2, 0)
}));

const MilestoneTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  minHeight: 180
}));

const MilestoneNode = styled(Paper)(({ theme, status, isCurrent, scale = 1 }) => ({
  minWidth: isCurrent ? 220 : 160,
  maxWidth: isCurrent ? 220 : 160,
  padding: theme.spacing(isCurrent ? 2.5 : 2),
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${
    status === 'completed' ? theme.palette.success.main :
    status === 'current' ? theme.palette.primary.main :
    status === 'overdue' ? theme.palette.error.main :
    theme.palette.grey[300]
  }`,
  backgroundColor:
    status === 'completed' ? theme.palette.success.light + '15' :
    status === 'current' ? theme.palette.primary.light + '15' :
    status === 'overdue' ? theme.palette.error.light + '15' :
    'white',
  position: 'relative',
  transition: 'all 0.3s ease',
  opacity: scale,
  transform: `scale(${isCurrent ? 1 : 0.9})`,
  boxShadow: isCurrent ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.06)'
}));

const ConnectorLine = styled(Box)(({ theme, status }) => ({
  width: theme.spacing(3),
  height: 2,
  background: status === 'completed'
    ? theme.palette.success.main
    : theme.palette.grey[300],
  flexShrink: 0
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  zIndex: 2,
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '20',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[100],
    opacity: 0.5
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #4A90E2 0%, #5B9FED 100%)'
  }
}));

const TimelineWidgetHorizontal = ({ data = {}, onUpdate }) => {
  const { spacing } = useResponsiveLayout();

  // Mock timeline milestones
  const allMilestones = [
    {
      id: 1,
      title: 'Contract Accepted',
      date: '2025-09-15',
      status: 'completed',
      priority: 'critical'
    },
    {
      id: 2,
      title: 'Earnest Money Deposited',
      date: '2025-09-18',
      status: 'completed',
      priority: 'critical'
    },
    {
      id: 3,
      title: 'Inspection Completed',
      date: '2025-10-05',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Appraisal Ordered',
      date: '2025-10-10',
      status: 'current',
      priority: 'high'
    },
    {
      id: 5,
      title: 'Loan Approval',
      date: '2025-10-25',
      status: 'pending',
      priority: 'critical'
    },
    {
      id: 6,
      title: 'Final Walkthrough',
      date: '2025-11-10',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 7,
      title: 'Closing',
      date: '2025-11-15',
      status: 'pending',
      priority: 'critical'
    }
  ];

  // Find current milestone index
  const currentIndex = allMilestones.findIndex(m => m.status === 'current') || 0;
  const [centerIndex, setCenterIndex] = useState(currentIndex);

  // Calculate visible milestones (2 before, current, 2 after)
  const getVisibleMilestones = () => {
    const visible = [];
    for (let i = centerIndex - 2; i <= centerIndex + 2; i++) {
      if (i >= 0 && i < allMilestones.length) {
        visible.push({
          ...allMilestones[i],
          relativePosition: i - centerIndex, // -2, -1, 0, 1, 2
          isCurrent: i === centerIndex
        });
      }
    }
    return visible;
  };

  const visibleMilestones = getVisibleMilestones();

  const completedMilestones = allMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = allMilestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

  const handlePrevious = () => {
    if (centerIndex > 0) {
      setCenterIndex(centerIndex - 1);
    }
  };

  const handleNext = () => {
    if (centerIndex < allMilestones.length - 1) {
      setCenterIndex(centerIndex + 1);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ fontSize: 24, color: 'success.main' }} />;
      case 'current':
        return <Schedule sx={{ fontSize: 24, color: 'primary.main' }} />;
      case 'overdue':
        return <Warning sx={{ fontSize: 24, color: 'error.main' }} />;
      default:
        return <RadioButtonUnchecked sx={{ fontSize: 24, color: 'grey.400' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'current':
        return 'primary';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d');
    } catch {
      return dateString;
    }
  };

  const getDaysUntil = (dateString) => {
    try {
      const date = parseISO(dateString);
      const days = differenceInDays(date, new Date());
      if (days < 0) return `${Math.abs(days)}d overdue`;
      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      return `${days} days`;
    } catch {
      return '';
    }
  };

  return (
    <HorizontalContainer
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarToday sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Transaction Timeline
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completedMilestones} of {totalMilestones} milestones • {progressPercentage}% complete
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Overall Progress Bar */}
      <Box mb={3}>
        <ProgressBar variant="determinate" value={progressPercentage} />
      </Box>

      {/* Carousel Timeline */}
      <CarouselContainer>
        {/* Previous Button */}
        <NavigationButton
          onClick={handlePrevious}
          disabled={centerIndex === 0}
          sx={{ left: -16 }}
          size="small"
        >
          <ChevronLeft />
        </NavigationButton>

        {/* Milestone Track */}
        <MilestoneTrack>
          <AnimatePresence mode="popLayout">
            {visibleMilestones.map((milestone, index) => (
              <React.Fragment key={milestone.id}>
                {/* Connector Line (before each milestone except first) */}
                {index > 0 && (
                  <ConnectorLine
                    component={motion.div}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    status={visibleMilestones[index - 1].status}
                  />
                )}

                {/* Milestone Node */}
                <MilestoneNode
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  status={milestone.status}
                  isCurrent={milestone.isCurrent}
                  scale={milestone.isCurrent ? 1 : 0.95}
                >
                  {/* Status Icon */}
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                    {getStatusIcon(milestone.status)}
                    {milestone.priority === 'critical' && (
                      <Tooltip title="Critical">
                        <Flag sx={{ fontSize: 16, color: 'error.main' }} />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant={milestone.isCurrent ? 'body1' : 'body2'}
                    fontWeight={milestone.isCurrent ? 700 : 600}
                    color="text.primary"
                    mb={1}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {milestone.title}
                  </Typography>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    {formatDate(milestone.date)}
                  </Typography>

                  {/* Status Chip */}
                  {milestone.status !== 'completed' && (
                    <Chip
                      label={getDaysUntil(milestone.date)}
                      size="small"
                      color={getStatusColor(milestone.status)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  )}

                  {milestone.status === 'completed' && (
                    <Chip
                      label="Complete"
                      size="small"
                      color="success"
                      icon={<CheckCircle sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  )}
                </MilestoneNode>
              </React.Fragment>
            ))}
          </AnimatePresence>
        </MilestoneTrack>

        {/* Next Button */}
        <NavigationButton
          onClick={handleNext}
          disabled={centerIndex === allMilestones.length - 1}
          sx={{ right: -16 }}
          size="small"
        >
          <ChevronRight />
        </NavigationButton>
      </CarouselContainer>

      {/* Milestone Counter */}
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Showing milestone {centerIndex + 1} of {totalMilestones}
        </Typography>
      </Box>
    </HorizontalContainer>
  );
};

export default TimelineWidgetHorizontal;
