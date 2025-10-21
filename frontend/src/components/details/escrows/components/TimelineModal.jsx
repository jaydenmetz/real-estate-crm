import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, CheckCircle, Schedule, RadioButtonUnchecked } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EditableField from './EditableField';
import { formatDate } from '../../../../utils/formatters';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 700,
    width: '100%',
  },
}));

const HeaderGradient = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const MilestoneRow = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  backgroundColor: status === 'complete' ? theme.palette.success.light + '15' : theme.palette.grey[50],
  border: `1px solid ${status === 'complete' ? theme.palette.success.main + '40' : theme.palette.grey[200]}`,
  position: 'relative',
  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    left: 22,
    top: '100%',
    width: 2,
    height: theme.spacing(1.5),
    backgroundColor: status === 'complete' ? theme.palette.success.light : theme.palette.grey[300],
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
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  };
});

const TimelineModal = ({ open, onClose, escrow, onUpdate }) => {
  const timeline = escrow?.timeline || {};
  const today = new Date();

  // Helper to calculate days until/since
  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago`, isPast: true };
    if (diffDays === 0) return { text: 'Today', isToday: true };
    return { text: `${diffDays} days away`, isFuture: true };
  };

  // Define all milestones with field keys
  const milestones = [
    {
      id: 'acceptance',
      label: 'Offer Accepted',
      date: timeline.acceptanceDate,
      field: 'timeline.acceptanceDate',
      required: true,
    },
    {
      id: 'emd',
      label: 'EMD Deposited',
      date: timeline.emdDate,
      field: 'timeline.emdDate',
      required: true,
    },
    {
      id: 'inspection',
      label: 'Home Inspection',
      date: timeline.homeInspectionDate,
      field: 'timeline.homeInspectionDate',
      required: true,
    },
    {
      id: 'appraisal',
      label: 'Appraisal',
      date: timeline.appraisalDate,
      field: 'timeline.appraisalDate',
      required: true,
    },
    {
      id: 'loanContingency',
      label: 'Loan Contingency Removal',
      date: timeline.loanContingencyDate,
      field: 'timeline.loanContingencyDate',
      required: false,
    },
    {
      id: 'inspectionContingency',
      label: 'Inspection Contingency Removal',
      date: timeline.inspectionContingencyDate,
      field: 'timeline.inspectionContingencyDate',
      required: false,
    },
    {
      id: 'allContingencies',
      label: 'All Contingencies Removed',
      date: timeline.allContingenciesRemovalDate,
      field: 'timeline.allContingenciesRemovalDate',
      required: true,
    },
    {
      id: 'finalWalkthrough',
      label: 'Final Walkthrough',
      date: timeline.finalWalkthroughDate,
      field: 'timeline.finalWalkthroughDate',
      required: false,
    },
    {
      id: 'coe',
      label: 'Close of Escrow',
      date: timeline.coeDate || escrow.closing_date,
      field: 'timeline.coeDate',
      required: true,
    },
  ];

  // Determine status for each milestone
  const milestonesWithStatus = milestones.map((milestone) => {
    if (!milestone.date) {
      return { ...milestone, status: 'pending' };
    }

    const milestoneDate = new Date(milestone.date);
    if (milestoneDate < today) {
      return { ...milestone, status: 'complete' };
    } else {
      const upcomingMilestones = milestones.filter(m => m.date && new Date(m.date) >= today);
      const nextMilestone = upcomingMilestones.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      return {
        ...milestone,
        status: milestone.id === nextMilestone?.id ? 'active' : 'pending',
      };
    }
  });

  // Handle field update
  const handleUpdateField = async (field, value) => {
    if (onUpdate) {
      const [category, key] = field.split('.');
      await onUpdate({
        [category]: {
          ...timeline,
          [key]: value,
        },
      });
    }
  };

  // Calculate completion
  const totalMilestones = milestones.length;
  const completedMilestones = milestonesWithStatus.filter(m => m.status === 'complete').length;
  const completionPercent = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <HeaderGradient>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Timeline & Deadlines
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
            {completedMilestones}/{totalMilestones} milestones completed ({completionPercent}%)
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </HeaderGradient>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
          Click any date to edit
        </Typography>

        {milestonesWithStatus.map((milestone) => {
          const daysInfo = getDaysUntil(milestone.date);
          const isPast = daysInfo?.isPast;
          const isToday = daysInfo?.isToday;

          return (
            <MilestoneRow key={milestone.id} status={milestone.status}>
              <StatusIcon status={milestone.status}>
                {milestone.status === 'complete' && <CheckCircle fontSize="large" />}
                {milestone.status === 'active' && <Schedule fontSize="large" />}
                {milestone.status === 'pending' && <RadioButtonUnchecked fontSize="large" />}
              </StatusIcon>

              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography
                      variant="body1"
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
                      {milestone.required && <span style={{ color: '#E74C3C', marginLeft: 4 }}>*</span>}
                    </Typography>
                    {daysInfo && (
                      <Typography
                        variant="caption"
                        fontWeight="600"
                        sx={{
                          color: isToday ? 'warning.main' : milestone.status === 'active' ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {daysInfo.text}
                      </Typography>
                    )}
                  </Box>

                  <EditableField
                    value={milestone.date}
                    onSave={(value) => handleUpdateField(milestone.field, value)}
                    type="date"
                    format={(date) => formatDate(date, 'MMM d, yyyy')}
                    displayClass="MuiTypography-root MuiTypography-body1"
                    placeholder="Click to set date"
                    disabled={!onUpdate}
                  />
                </Box>

                {milestone.status === 'complete' && (
                  <Typography variant="caption" color="success.main" fontWeight="600">
                    ✓ Completed
                  </Typography>
                )}
              </Box>
            </MilestoneRow>
          );
        })}

        <Box mt={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Fields marked with * are required milestones for a typical real estate transaction.
          </Typography>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default TimelineModal;
