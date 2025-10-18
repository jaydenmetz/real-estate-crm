import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert
} from '@mui/material';
import { Close, Schedule, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiInstance from '../../../../services/api.service';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 700,
    width: '100%',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  color: 'white',
}));

const MilestoneSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  marginBottom: theme.spacing(2),
}));

/**
 * TimelineDetailModal - Full timeline editor
 * Phase 6: Allows editing all escrow timeline dates
 */
const TimelineDetailModal = ({ open, onClose, escrow, onUpdate }) => {
  const [timeline, setTimeline] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (escrow?.timeline) {
      setTimeline(escrow.timeline);
    }
  }, [escrow]);

  const milestones = [
    { key: 'acceptanceDate', label: 'Offer Acceptance', icon: '✓' },
    { key: 'emdDate', label: 'EMD Deposited', icon: '💰' },
    { key: 'homeInspectionDate', label: 'Home Inspection', icon: '🏠' },
    { key: 'appraisalDate', label: 'Appraisal', icon: '📊' },
    { key: 'loanApprovalDate', label: 'Loan Approval', icon: '🏦' },
    { key: 'allContingenciesRemovalDate', label: 'All Contingencies Removal', icon: '⚠️' },
    { key: 'titleDate', label: 'Title Report Received', icon: '📜' },
    { key: 'finalWalkthroughDate', label: 'Final Walkthrough', icon: '👁️' },
    { key: 'coeDate', label: 'Close of Escrow (COE)', icon: '🎉' },
    { key: 'recordingDate', label: 'Recording Date', icon: '📝' },
  ];

  const handleDateChange = (key, newValue) => {
    setTimeline(prev => ({
      ...prev,
      [key]: newValue ? newValue.toISOString() : null
    }));
  };

  const handleNotesChange = (key, value) => {
    setTimeline(prev => ({
      ...prev,
      [`${key}Notes`]: value
    }));
  };

  const handleSave = async () => {
    if (!escrow?.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await apiInstance.put(`/escrows/${escrow.id}/timeline`, timeline);

      if (response.data?.success) {
        // Notify parent component
        if (onUpdate) {
          onUpdate({ timeline });
        }
        onClose();
      } else {
        setError(response.data?.error?.message || 'Failed to save timeline');
      }
    } catch (err) {
      console.error('Error saving timeline:', err);
      setError(err.response?.data?.error?.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <Header>
          <Box display="flex" alignItems="center" gap={1}>
            <Schedule />
            <Typography variant="h6" fontWeight="700">
              Timeline & Deadlines
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
          >
            <Close />
          </Button>
        </Header>

        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage all important dates and deadlines for this escrow. Dates in the past will automatically mark milestones as complete.
          </Typography>

          <Grid container spacing={2}>
            {milestones.map((milestone) => (
              <Grid item xs={12} key={milestone.key}>
                <MilestoneSection>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Typography fontSize="1.5rem">{milestone.icon}</Typography>
                    <Typography variant="subtitle1" fontWeight="600">
                      {milestone.label}
                    </Typography>
                    {timeline[milestone.key] && new Date(timeline[milestone.key]) < new Date() && (
                      <CheckCircle sx={{ fontSize: 18, color: 'success.main', ml: 'auto' }} />
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Date"
                        value={formatDate(timeline[milestone.key])}
                        onChange={(newValue) => handleDateChange(milestone.key, newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            helperText: getDaysUntil(timeline[milestone.key])
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Notes (optional)"
                        placeholder="Add any notes about this milestone..."
                        value={timeline[`${milestone.key}Notes`] || ''}
                        onChange={(e) => handleNotesChange(milestone.key, e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </MilestoneSection>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.dark">
              💡 Tip: Dates will automatically sync to your calendar and trigger reminders based on your automation settings.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Timeline'}
          </Button>
        </DialogActions>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default TimelineDetailModal;
