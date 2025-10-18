import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  Tooltip,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Warning,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  Flag
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

const HorizontalContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white',
  marginBottom: theme.spacing(3)
}));

const TimelineTrack = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2, 0),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  overflowX: 'auto',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    height: 6
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: 3
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: 3,
    '&:hover': {
      background: theme.palette.primary.main
    }
  }
}));

const MilestoneNode = styled(Paper)(({ theme, status, isFirst, isLast }) => ({
  minWidth: 200,
  maxWidth: 250,
  padding: theme.spacing(2),
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
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  },
  // Connecting line (except for last item)
  ...(
!isLast && {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: -theme.spacing(2) - 1,
      width: theme.spacing(2),
      height: 2,
      background: status === 'completed'
        ? theme.palette.success.main
        : theme.palette.grey[300],
      transform: 'translateY(-50%)',
      zIndex: 0
    }
  })
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #4A90E2 0%, #5B9FED 100%)' // Blue gradient (escrows theme)
  }
}));

const TimelineWidgetHorizontal = ({ data = {}, onUpdate }) => {
  const { spacing } = useResponsiveLayout();
  const [expanded, setExpanded] = useState(false);

  // Mock timeline milestones - will be replaced with real data
  const milestones = [
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

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
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
      if (days < 0) return `${Math.abs(days)} days overdue`;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
              {completedMilestones} of {totalMilestones} milestones completed
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="700" color="primary.main">
              {progressPercentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Complete
            </Typography>
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Overall Progress Bar */}
      <Box mb={3}>
        <ProgressBar variant="determinate" value={progressPercentage} />
      </Box>

      {/* Horizontal Timeline */}
      <TimelineTrack>
        {milestones.map((milestone, index) => (
          <MilestoneNode
            key={milestone.id}
            status={milestone.status}
            isFirst={index === 0}
            isLast={index === milestones.length - 1}
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Status Icon */}
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
              {getStatusIcon(milestone.status)}
              {milestone.priority === 'critical' && (
                <Tooltip title="Critical Milestone">
                  <Flag sx={{ fontSize: 16, color: 'error.main' }} />
                </Tooltip>
              )}
            </Box>

            {/* Title */}
            <Typography variant="body2" fontWeight="600" color="text.primary" mb={1}>
              {milestone.title}
            </Typography>

            {/* Date */}
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              {formatDate(milestone.date)}
            </Typography>

            {/* Days Until */}
            {milestone.status !== 'completed' && (
              <Chip
                label={getDaysUntil(milestone.date)}
                size="small"
                color={getStatusColor(milestone.status)}
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            )}

            {/* Completed Badge */}
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
        ))}
      </TimelineTrack>

      {/* Legend */}
      <Box mt={3} pt={2} borderTop={1} borderColor="divider">
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              Completed
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Schedule sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary">
              In Progress
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <RadioButtonUnchecked sx={{ fontSize: 18, color: 'grey.400' }} />
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Flag sx={{ fontSize: 18, color: 'error.main' }} />
            <Typography variant="caption" color="text.secondary">
              Critical Milestone
            </Typography>
          </Box>
        </Stack>
      </Box>
    </HorizontalContainer>
  );
};

export default TimelineWidgetHorizontal;
