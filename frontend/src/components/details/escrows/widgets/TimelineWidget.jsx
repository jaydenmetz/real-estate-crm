import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Tooltip,
  Paper,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  Flag as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';

// Styled components
const WidgetCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
  }
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3, 0),
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    height: 8,
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.5)',
    }
  }
}));

const TimelineTrack = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: 4,
  background: 'rgba(255, 255, 255, 0.2)',
  transform: 'translateY(-50%)',
  borderRadius: 2,
}));

const TimelineProgress = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  height: 4,
  background: 'linear-gradient(90deg, #00ff88 0%, #00bbff 100%)',
  transform: 'translateY(-50%)',
  borderRadius: 2,
  boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
}));

const MilestoneNode = styled(motion.div)(({ theme, status, size = 40 }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: status === 'completed' 
    ? 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)'
    : status === 'current'
    ? 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)'
    : 'rgba(255, 255, 255, 0.3)',
  border: '3px solid white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transform: 'translateY(-50%)',
  boxShadow: status === 'current' 
    ? '0 0 30px rgba(255, 215, 0, 0.8)'
    : '0 4px 12px rgba(0, 0, 0, 0.2)',
  zIndex: status === 'current' ? 3 : 2,
  '&:hover': {
    transform: 'translateY(-50%) scale(1.2)',
    zIndex: 4,
  }
}));

const MilestoneLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  marginTop: theme.spacing(1),
  whiteSpace: 'nowrap',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
}));

const PulseAnimation = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  border: '2px solid currentColor',
}));

function TimelineWidget({ data, expanded, onExpand, onUpdate }) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [hoveredMilestone, setHoveredMilestone] = useState(null);
  
  if (!data) return null;

  // Define timeline milestones - handle both old and new field names
  const milestones = [
    { key: 'acceptanceDate', altKey: 'contractDate', label: 'Contract', icon: <EventIcon />, importance: 'high' },
    { key: 'homeInspectionDate', altKey: 'inspectionDate', label: 'Inspection', icon: <ScheduleIcon />, importance: 'medium' },
    { key: 'appraisalDate', label: 'Appraisal', icon: <TrendingIcon />, importance: 'medium' },
    { key: 'loanContingencyDate', altKey: 'loanApprovalDate', label: 'Loan Approval', icon: <CheckIcon />, importance: 'high' },
    { key: 'allContingenciesRemovalDate', altKey: 'clearToCloseDate', label: 'Clear to Close', icon: <FlagIcon />, importance: 'high' },
    { key: 'coeDate', altKey: 'closingDate', label: 'Closing', icon: <CheckIcon />, importance: 'critical' },
  ];

  // Helper to get milestone date
  const getMilestoneDate = (milestone) => {
    return data[milestone.key] || (milestone.altKey && data[milestone.altKey]);
  };

  // Calculate timeline progress
  const activeMilestones = milestones.filter(m => getMilestoneDate(m));
  const completedMilestones = activeMilestones.filter(m => {
    const dateValue = getMilestoneDate(m);
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return isBefore(date, new Date());
  });
  
  const contractDate = data.acceptanceDate || data.contractDate;
  const closingDate = data.coeDate || data.closingDate;
  
  const totalDays = contractDate && closingDate
    ? differenceInDays(new Date(closingDate), new Date(contractDate))
    : 30;
  
  const daysElapsed = contractDate
    ? differenceInDays(new Date(), new Date(contractDate))
    : 0;
  
  const progressPercentage = Math.min((daysElapsed / totalDays) * 100, 100);

  // Calculate milestone positions
  const getMilestonePosition = (date) => {
    if (!contractDate || !date) return 0;
    const start = new Date(contractDate);
    const milestone = new Date(date);
    const days = differenceInDays(milestone, start);
    return (days / totalDays) * 100;
  };

  const getMilestoneStatus = (date) => {
    if (!date) return 'pending';
    const milestoneDate = new Date(date);
    const today = new Date();
    if (isBefore(milestoneDate, today)) return 'completed';
    if (differenceInDays(milestoneDate, today) <= 7) return 'current';
    return 'upcoming';
  };

  // Stats calculations
  const daysToClose = closingDate
    ? differenceInDays(new Date(closingDate), new Date())
    : null;
  
  const completionRate = (completedMilestones.length / milestones.length) * 100;

  return (
    <WidgetCard
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated Background Pattern */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
        }}
        animate={{
          x: [0, 20],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Timeline
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              icon={<TimerIcon />}
              label={`${daysToClose || '?'} days to close`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <Chip
              label={`${completionRate.toFixed(0)}% Complete`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(0, 255, 136, 0.3)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>
        <CalendarIcon />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <StatCard>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Started
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {daysElapsed}
            </Typography>
            <Typography variant="caption">days ago</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={4}>
          <StatCard>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Progress
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {progressPercentage.toFixed(0)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ 
                mt: 1,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #00ff88 0%, #00bbff 100%)',
                }
              }}
            />
          </StatCard>
        </Grid>
        <Grid item xs={4}>
          <StatCard>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Milestones
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {completedMilestones.length}/{milestones.length}
            </Typography>
            <Typography variant="caption">completed</Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Interactive Timeline */}
      <TimelineContainer>
        <Box position="relative" height={80} minWidth={600}>
          <TimelineTrack />
          <TimelineProgress
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          
          {milestones.map((milestone, index) => {
            const date = getMilestoneDate(milestone);
            const position = getMilestonePosition(date);
            const status = getMilestoneStatus(date);
            
            return (
              <MilestoneNode
                key={milestone.key}
                status={status}
                size={milestone.importance === 'critical' ? 50 : 40}
                style={{ 
                  left: `${position}%`,
                  top: '50%',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
                onHoverStart={() => setHoveredMilestone(milestone.key)}
                onHoverEnd={() => setHoveredMilestone(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMilestone(milestone.key);
                }}
              >
                {status === 'current' && (
                  <>
                    <PulseAnimation
                      animate={{
                        scale: [1, 1.5],
                        opacity: [0.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <PulseAnimation
                      animate={{
                        scale: [1, 2],
                        opacity: [0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.5,
                        repeat: Infinity,
                      }}
                    />
                  </>
                )}
                {status === 'completed' ? <CheckIcon /> : milestone.icon}
                <MilestoneLabel>
                  {milestone.label}
                  {date && (
                    <Box component="span" display="block" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                      {format(new Date(date), 'MMM d')}
                    </Box>
                  )}
                </MilestoneLabel>
              </MilestoneNode>
            );
          })}
        </Box>
      </TimelineContainer>

      {/* Hover Details */}
      <AnimatePresence>
        {hoveredMilestone && milestones.find(m => m.key === hoveredMilestone) && getMilestoneDate(milestones.find(m => m.key === hoveredMilestone)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ marginTop: 16 }}
          >
            <StatCard>
              <Typography variant="subtitle2">
                {milestones.find(m => m.key === hoveredMilestone)?.label}
              </Typography>
              <Typography variant="body2">
                {format(new Date(getMilestoneDate(milestones.find(m => m.key === hoveredMilestone))), 'MMMM d, yyyy')}
              </Typography>
            </StatCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Indicator */}
      <Box display="flex" justifyContent="center" mt={2}>
        <IconButton
          size="small"
          sx={{ 
            color: 'white', 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.3s' 
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
    </WidgetCard>
  );
}

export default TimelineWidget;