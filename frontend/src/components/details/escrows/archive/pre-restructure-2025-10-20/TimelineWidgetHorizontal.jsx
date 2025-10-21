import React, { useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
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
  Flag
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

const HorizontalContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white',
  marginBottom: theme.spacing(3)
}));

const ScrollableTrack = styled(Box)(({ theme}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  overflowX: 'auto',
  overflowY: 'hidden',
  padding: theme.spacing(2, 0),
  cursor: 'grab',
  userSelect: 'none',
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.primary.light} ${theme.palette.grey[200]}`,
  '&:active': {
    cursor: 'grabbing'
  },
  '&::-webkit-scrollbar': {
    height: 8
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[200],
    borderRadius: 4
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: 4,
    '&:hover': {
      background: theme.palette.primary.main
    }
  },
  scrollBehavior: 'smooth'
}));

const MilestoneNode = styled(Paper)(({ theme, status }) => ({
  minWidth: 200,
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${
    status === 'completed' ? theme.palette.success.main :
    status === 'current' ? theme.palette.primary.main :
    status === 'overdue' ? theme.palette.error.main :
    theme.palette.grey[300]
  }`,
  backgroundColor:
    status === 'completed' ? theme.palette.success.light + '15' :
    status === 'current' ? theme.palette.primary.light + '20' :
    status === 'overdue' ? theme.palette.error.light + '15' :
    'white',
  position: 'relative',
  flexShrink: 0,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    borderWidth: 3
  }
}));

const ConnectorLine = styled(Box)(({ theme, status }) => ({
  minWidth: theme.spacing(3),
  height: 2,
  background: status === 'completed'
    ? theme.palette.success.main
    : theme.palette.grey[300],
  flexShrink: 0,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    right: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: status === 'completed'
      ? theme.palette.success.main
      : theme.palette.grey[300]
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
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const allMilestones = [
    { id: 1, title: 'Contract Accepted', date: '2025-09-15', status: 'completed', priority: 'critical' },
    { id: 2, title: 'Earnest Money Deposited', date: '2025-09-18', status: 'completed', priority: 'critical' },
    { id: 3, title: 'Inspection Completed', date: '2025-10-05', status: 'completed', priority: 'high' },
    { id: 4, title: 'Appraisal Ordered', date: '2025-10-10', status: 'current', priority: 'high' },
    { id: 5, title: 'Loan Approval', date: '2025-10-25', status: 'pending', priority: 'critical' },
    { id: 6, title: 'Final Walkthrough', date: '2025-11-10', status: 'pending', priority: 'high' },
    { id: 7, title: 'Closing', date: '2025-11-15', status: 'pending', priority: 'critical' }
  ];

  const completedMilestones = allMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = allMilestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ fontSize: 28, color: 'success.main' }} />;
      case 'current':
        return <Schedule sx={{ fontSize: 28, color: 'primary.main' }} />;
      case 'overdue':
        return <Warning sx={{ fontSize: 28, color: 'error.main' }} />;
      default:
        return <RadioButtonUnchecked sx={{ fontSize: 28, color: 'grey.400' }} />;
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
      return format(date, 'MMM d, yyyy');
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

      <Box mb={3}>
        <ProgressBar variant="determinate" value={progressPercentage} />
      </Box>

      <ScrollableTrack
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {allMilestones.map((milestone, index) => (
          <React.Fragment key={milestone.id}>
            {index > 0 && (
              <ConnectorLine status={allMilestones[index - 1].status} />
            )}

            <MilestoneNode
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              status={milestone.status}
              whileHover={{ scale: 1.05 }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                {getStatusIcon(milestone.status)}
                {milestone.priority === 'critical' && (
                  <Tooltip title="Critical Milestone" arrow>
                    <Flag sx={{ fontSize: 18, color: 'error.main' }} />
                  </Tooltip>
                )}
              </Box>

              <Typography
                variant="body1"
                fontWeight={milestone.status === 'current' ? 700 : 600}
                color="text.primary"
                mb={1}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  minHeight: 48
                }}
              >
                {milestone.title}
              </Typography>

              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                📅 {formatDate(milestone.date)}
              </Typography>

              {milestone.status !== 'completed' && (
                <Chip
                  label={getDaysUntil(milestone.date)}
                  size="small"
                  color={getStatusColor(milestone.status)}
                  sx={{ fontWeight: 600, fontSize: '0.7rem', width: '100%' }}
                />
              )}

              {milestone.status === 'completed' && (
                <Chip
                  label="✓ Complete"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600, fontSize: '0.7rem', width: '100%' }}
                />
              )}
            </MilestoneNode>
          </React.Fragment>
        ))}
      </ScrollableTrack>

      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          ← Drag or scroll to see all milestones →
        </Typography>
      </Box>
    </HorizontalContainer>
  );
};

export default TimelineWidgetHorizontal;
