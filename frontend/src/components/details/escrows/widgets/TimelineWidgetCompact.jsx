import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, differenceInDays, isBefore } from 'date-fns';

// Styled components with purple theme
const WidgetCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: '1px solid rgba(118, 75, 162, 0.1)',
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)'
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  background: 'white',
  borderRadius: theme.spacing(0.75),
  marginBottom: theme.spacing(1),
  border: '1px solid rgba(118, 75, 162, 0.08)',
  '&.completed': {
    background: 'rgba(102, 126, 234, 0.05)',
    borderColor: 'rgba(102, 126, 234, 0.2)'
  },
  '&.upcoming': {
    background: 'rgba(118, 75, 162, 0.05)',
    borderColor: 'rgba(118, 75, 162, 0.2)'
  }
}));

const DateLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.grey[600],
  minWidth: 80
}));

function TimelineWidgetCompact({ data }) {
  if (!data) return null;

  const getMilestoneDate = (keys) => {
    for (const key of keys) {
      if (data[key]) return data[key];
    }
    return null;
  };

  const milestones = [
    { 
      label: 'Contract', 
      date: getMilestoneDate(['acceptanceDate', 'acceptance_date', 'contractDate']),
      icon: <CalendarIcon />,
      priority: 'high'
    },
    { 
      label: 'Inspection', 
      date: getMilestoneDate(['inspectionDate', 'inspection_date', 'homeInspectionDate']),
      icon: <CheckIcon />,
      priority: 'medium'
    },
    { 
      label: 'Appraisal', 
      date: getMilestoneDate(['appraisalDate', 'appraisal_date']),
      icon: <CheckIcon />,
      priority: 'medium'
    },
    { 
      label: 'Loan Approval', 
      date: getMilestoneDate(['loanApprovalDate', 'loan_approval_date', 'loanContingencyDate']),
      icon: <CheckIcon />,
      priority: 'high'
    },
    { 
      label: 'Clear to Close', 
      date: getMilestoneDate(['clearToCloseDate', 'clear_to_close_date', 'allContingenciesRemovalDate']),
      icon: <FlagIcon />,
      priority: 'high'
    },
    { 
      label: 'Closing', 
      date: getMilestoneDate(['closingDate', 'closing_date', 'coeDate', 'coe_date']),
      icon: <FlagIcon />,
      priority: 'critical'
    }
  ];

  const activeMilestones = milestones.filter(m => m.date);
  const completedMilestones = activeMilestones.filter(m => {
    if (!m.date) return false;
    return isBefore(new Date(m.date), new Date());
  });

  const progress = activeMilestones.length > 0 
    ? (completedMilestones.length / activeMilestones.length) * 100 
    : 0;

  const nextMilestone = milestones.find(m => 
    m.date && !isBefore(new Date(m.date), new Date())
  );

  const daysToClose = () => {
    const closingDate = getMilestoneDate(['closingDate', 'closing_date', 'coeDate', 'coe_date']);
    if (!closingDate) return null;
    return differenceInDays(new Date(closingDate), new Date());
  };

  const dtc = daysToClose();

  return (
    <WidgetCard elevation={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="600" color="#764ba2">
          Timeline
        </Typography>
        <Box display="flex" gap={1}>
          {dtc !== null && (
            <Chip
              label={`${dtc} days to close`}
              size="small"
              sx={{ 
                bgcolor: dtc <= 7 ? 'error.light' : 'rgba(118, 75, 162, 0.1)',
                color: dtc <= 7 ? 'white' : '#764ba2',
                fontWeight: 'bold'
              }}
            />
          )}
          <Chip
            label={`${Math.round(progress)}%`}
            size="small"
            sx={{ 
              bgcolor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'rgba(118, 75, 162, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3
          },
          mb: 2
        }}
      />

      <Grid container spacing={1}>
        {milestones.slice(0, 6).map((milestone, index) => {
          if (!milestone.date) return null;
          const isCompleted = isBefore(new Date(milestone.date), new Date());
          
          return (
            <Grid item xs={6} sm={4} key={index}>
              <TimelineItem className={isCompleted ? 'completed' : 'upcoming'}>
                {isCompleted ? (
                  <CheckIcon sx={{ fontSize: 16, color: '#667eea', mr: 1 }} />
                ) : (
                  <PendingIcon sx={{ fontSize: 16, color: '#764ba2', mr: 1 }} />
                )}
                <Box flex={1} minWidth={0}>
                  <Typography variant="caption" fontWeight={500} noWrap>
                    {milestone.label}
                  </Typography>
                  <DateLabel>
                    {format(new Date(milestone.date), 'MMM d')}
                  </DateLabel>
                </Box>
              </TimelineItem>
            </Grid>
          );
        })}
      </Grid>

      {nextMilestone && (
        <Box mt={2} p={1.5} bgcolor="rgba(118, 75, 162, 0.05)" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            Next: <strong>{nextMilestone.label}</strong> on {format(new Date(nextMilestone.date), 'MMMM d, yyyy')}
          </Typography>
        </Box>
      )}
    </WidgetCard>
  );
}

export default TimelineWidgetCompact;