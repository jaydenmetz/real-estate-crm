import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  Button,
  Tooltip,
  Paper,
  Collapse,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Warning,
  Edit,
  ExpandMore,
  ExpandLess,
  EventAvailable,
  EventBusy,
  AccessTime,
  TrendingUp,
  Flag,
  NotificationsActive,
  DateRange
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';

const WidgetContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white'
}));

const TimelineProgress = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}15 100%)`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3)
}));

const MilestoneCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${
    status === 'completed' ? theme.palette.success.light :
    status === 'current' ? theme.palette.primary.main :
    status === 'overdue' ? theme.palette.error.light :
    theme.palette.grey[300]
  }`,
  backgroundColor: 
    status === 'completed' ? theme.palette.success.light + '10' :
    status === 'current' ? theme.palette.primary.light + '10' :
    status === 'overdue' ? theme.palette.error.light + '10' :
    'white',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
  }
}));

const DateChip = styled(Chip)(({ theme, dateStatus }) => ({
  fontWeight: 600,
  backgroundColor: 
    dateStatus === 'completed' ? theme.palette.success.main :
    dateStatus === 'today' ? theme.palette.warning.main :
    dateStatus === 'overdue' ? theme.palette.error.main :
    dateStatus === 'upcoming' ? theme.palette.info.main :
    theme.palette.grey[500],
  color: 'white',
  '& .MuiChip-icon': {
    color: 'white'
  }
}));

const StatusIcon = ({ status }) => {
  switch(status) {
    case 'completed':
      return <CheckCircle sx={{ color: 'success.main' }} />;
    case 'current':
      return <Schedule sx={{ color: 'primary.main' }} />;
    case 'overdue':
      return <Warning sx={{ color: 'error.main' }} />;
    default:
      return <RadioButtonUnchecked sx={{ color: 'text.disabled' }} />;
  }
};

const TimelineWidget = ({ data = {}, onEdit }) => {
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, calendar, list

  // Parse timeline data
  const contractDate = data.contract_date || data.contractDate;
  const closingDate = data.closing_date || data.closingDate;
  const escrowOpenedDate = data.escrow_opened_date || data.escrowOpenedDate;
  const contingencyRemovalDate = data.contingency_removal_date || data.contingencyRemovalDate;
  const finalWalkthroughDate = data.final_walkthrough_date || data.finalWalkthroughDate;
  
  // Calculate key milestones
  const today = new Date();
  const milestones = [
    {
      id: 'contract',
      title: 'Contract Executed',
      date: contractDate,
      description: 'Purchase agreement signed by all parties',
      icon: <EventAvailable />,
      required: true
    },
    {
      id: 'escrow_opened',
      title: 'Escrow Opened',
      date: escrowOpenedDate,
      description: 'Escrow account established and earnest money deposited',
      icon: <AccountBalance />,
      required: true
    },
    {
      id: 'inspection',
      title: 'Home Inspection',
      date: data.inspection_date || (contractDate ? addDays(parseISO(contractDate), 10) : null),
      description: 'Professional property inspection completed',
      icon: <Assessment />,
      required: false
    },
    {
      id: 'appraisal',
      title: 'Property Appraisal',
      date: data.appraisal_date || (contractDate ? addDays(parseISO(contractDate), 14) : null),
      description: 'Lender appraisal to determine property value',
      icon: <AttachMoney />,
      required: false
    },
    {
      id: 'loan_approval',
      title: 'Loan Approval',
      date: data.loan_approval_date || (contractDate ? addDays(parseISO(contractDate), 21) : null),
      description: 'Final loan approval from lender',
      icon: <Approval />,
      required: false
    },
    {
      id: 'contingency',
      title: 'Contingency Removal',
      date: contingencyRemovalDate,
      description: 'All contingencies removed by buyer',
      icon: <CheckCircle />,
      required: true
    },
    {
      id: 'final_walkthrough',
      title: 'Final Walkthrough',
      date: finalWalkthroughDate || (closingDate ? addDays(parseISO(closingDate), -1) : null),
      description: 'Buyer final property inspection',
      icon: <Home />,
      required: false
    },
    {
      id: 'closing',
      title: 'Closing Date',
      date: closingDate,
      description: 'Transaction closes and ownership transfers',
      icon: <Flag />,
      required: true
    }
  ].filter(m => m.date); // Only show milestones with dates

  // Calculate milestone status
  const getMilestoneStatus = (milestone) => {
    if (!milestone.date) return 'pending';
    const mDate = parseISO(milestone.date);
    
    if (data[`${milestone.id}_completed`]) return 'completed';
    if (isBefore(mDate, today) && !data[`${milestone.id}_completed`]) return 'overdue';
    if (differenceInDays(mDate, today) === 0) return 'current';
    if (differenceInDays(mDate, today) <= 7) return 'upcoming';
    return 'pending';
  };

  // Calculate overall progress
  const completedMilestones = milestones.filter(m => 
    getMilestoneStatus(m) === 'completed'
  ).length;
  const progress = milestones.length > 0 
    ? (completedMilestones / milestones.length) * 100 
    : 0;

  // Calculate days to closing
  const daysToClosing = closingDate 
    ? differenceInDays(parseISO(closingDate), today)
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDateStatus = (dateString) => {
    if (!dateString) return 'pending';
    const date = parseISO(dateString);
    const diff = differenceInDays(date, today);
    
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'today';
    if (diff <= 7) return 'upcoming';
    return 'future';
  };

  return (
    <WidgetContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Transaction Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completedMilestones} of {milestones.length} milestones completed
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            size="small"
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <IconButton size="small" onClick={() => onEdit?.('timeline')}>
            <Edit />
          </IconButton>
        </Stack>
      </Box>

      {/* Progress Overview */}
      <TimelineProgress>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {progress.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction Progress
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'primary.light',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={3} justifyContent="flex-end">
              {daysToClosing !== null && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" color={
                    daysToClosing < 0 ? 'error.main' :
                    daysToClosing <= 7 ? 'warning.main' :
                    'success.main'
                  }>
                    {Math.abs(daysToClosing)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {daysToClosing < 0 ? 'Days Overdue' : 'Days to Close'}
                  </Typography>
                </Box>
              )}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {milestones.length - completedMilestones}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Remaining Tasks
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </TimelineProgress>

      {/* Important Dates Alert */}
      {milestones.some(m => getMilestoneStatus(m) === 'overdue') && (
        <Alert
          severity="error"
          icon={<Warning />}
          sx={{ mb: 3 }}
        >
          You have overdue milestones that need immediate attention
        </Alert>
      )}

      {/* Milestones */}
      <Stack spacing={2}>
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const isExpanded = expandedMilestone === milestone.id;
          
          return (
            <MilestoneCard
              key={milestone.id}
              status={status}
              elevation={0}
              onClick={() => setExpandedMilestone(
                isExpanded ? null : milestone.id
              )}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ pt: 0.5 }}>
                  <StatusIcon status={status} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {milestone.title}
                    </Typography>
                    {milestone.required && (
                      <Chip label="Required" size="small" color="primary" />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DateChip
                      icon={<CalendarToday />}
                      label={formatDate(milestone.date)}
                      size="small"
                      dateStatus={getDateStatus(milestone.date)}
                    />
                    {status === 'overdue' && (
                      <Chip
                        icon={<Warning />}
                        label="Overdue"
                        size="small"
                        color="error"
                      />
                    )}
                    {status === 'current' && (
                      <Chip
                        icon={<NotificationsActive />}
                        label="Due Today"
                        size="small"
                        color="warning"
                      />
                    )}
                  </Box>
                  
                  <Collapse in={isExpanded}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {milestone.description}
                    </Typography>
                  </Collapse>
                </Box>
                <IconButton size="small">
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </MilestoneCard>
          );
        })}
      </Stack>

      {milestones.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          <DateRange sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1">
            No timeline dates set yet
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onEdit?.('timeline')}
          >
            Set Timeline Dates
          </Button>
        </Box>
      )}
    </WidgetContainer>
  );
};

// Import missing icons
const AccountBalance = () => <Business />;
const Assessment = () => <TrendingUp />;
const AttachMoney = () => <AttachMoney />;
const Approval = () => <CheckCircle />;
const Home = () => <Home />;

export default TimelineWidget;