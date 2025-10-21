import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Email,
  Description,
  FileUpload,
  Edit,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import apiInstance from '../../../../services/api.service';

// PHASE 5: Left Sidebar (200px wide, Quick Actions + Notes + Reminders)
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 200,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  justifyContent: 'flex-start',
}));

const ReminderItem = styled(Box)(({ theme, overdue }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
  borderLeft: `3px solid ${
    overdue ? theme.palette.error.main : theme.palette.primary.main
  }`,
  paddingLeft: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const LeftSidebar = ({ escrow, loading, onUpdate }) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusValue, setStatusValue] = useState('active');

  useEffect(() => {
    if (escrow?.notes) {
      setNotes(escrow.notes);
    }
    if (escrow?.details?.escrowStatus || escrow?.status) {
      setStatusValue(escrow.details?.escrowStatus || escrow.status);
    }
  }, [escrow]);

  // Debounced autosave for notes
  const saveNotes = useCallback(
    debounce(async (value) => {
      if (!escrow?.id) return;

      setSaving(true);
      try {
        await apiInstance.put(`/escrows/${escrow.id}`, {
          notes: value
        });
        if (onUpdate) onUpdate({ notes: value });
      } catch (error) {
        console.error('Failed to save notes:', error);
      } finally {
        setSaving(false);
      }
    }, 1000),
    [escrow?.id, onUpdate]
  );

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    saveNotes(value);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusValue(newStatus);

    if (!escrow?.id) return;

    try {
      await apiInstance.put(`/escrows/${escrow.id}`, {
        details: {
          ...escrow.details,
          escrowStatus: newStatus
        }
      });
      if (onUpdate) onUpdate({ status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Email all parties
  const handleEmailAllParties = () => {
    const people = escrow?.people || {};
    const emails = Object.values(people)
      .filter(person => person?.email)
      .map(person => person.email)
      .join(',');

    const subject = `Escrow Update - ${escrow?.details?.propertyAddress || escrow?.property_address}`;
    window.location.href = `mailto:${emails}?subject=${encodeURIComponent(subject)}`;
  };

  // Generate statement (placeholder)
  const handleGenerateStatement = () => {
    alert('Statement generation coming in Phase 6');
  };

  // Request documents (placeholder)
  const handleRequestDocuments = () => {
    alert('Document request coming in Phase 6');
  };

  // Extract reminders from timeline
  const getReminders = () => {
    const timeline = escrow?.timeline || {};
    const today = new Date();

    const reminders = [
      { label: 'Home Inspection', date: timeline.homeInspectionDate },
      { label: 'Appraisal', date: timeline.appraisalDate },
      { label: 'Contingency Removal', date: timeline.allContingenciesRemovalDate },
      { label: 'Final Walkthrough', date: timeline.finalWalkthroughDate },
      { label: 'Close of Escrow', date: timeline.coeDate }
    ]
      .filter(r => r.date)
      .map(r => ({
        ...r,
        dateObj: new Date(r.date),
        overdue: new Date(r.date) < today
      }))
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 3);

    return reminders;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <SidebarContainer>
        <SectionCard>
          <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={36} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </SectionCard>
        <SectionCard>
          <Skeleton width="50%" height={20} sx={{ mb: 1 }} />
          <Skeleton width="100%" height={80} sx={{ borderRadius: 1 }} />
        </SectionCard>
      </SidebarContainer>
    );
  }

  const reminders = getReminders();

  return (
    <SidebarContainer
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quick Actions */}
      <SectionCard>
        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          QUICK ACTIONS
        </Typography>

        <ActionButton
          variant="outlined"
          startIcon={<Email sx={{ fontSize: 18 }} />}
          onClick={handleEmailAllParties}
        >
          Email Parties
        </ActionButton>

        <ActionButton
          variant="outlined"
          startIcon={<Description sx={{ fontSize: 18 }} />}
          onClick={handleGenerateStatement}
        >
          Statement
        </ActionButton>

        <ActionButton
          variant="outlined"
          startIcon={<FileUpload sx={{ fontSize: 18 }} />}
          onClick={handleRequestDocuments}
        >
          Request Docs
        </ActionButton>

        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusValue}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </SectionCard>

      {/* Quick Notes */}
      <SectionCard>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="caption" fontWeight="700" color="text.secondary">
            QUICK NOTES
          </Typography>
          {saving && (
            <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.65rem' }}>
              Saving...
            </Typography>
          )}
        </Box>

        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="Add notes about this escrow..."
          value={notes}
          onChange={handleNotesChange}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.75rem',
            },
          }}
        />
      </SectionCard>

      {/* Active Reminders */}
      {reminders.length > 0 && (
        <SectionCard>
          <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            UPCOMING
          </Typography>

          {reminders.map((reminder, index) => (
            <ReminderItem key={index} overdue={reminder.overdue}>
              {reminder.overdue ? (
                <ErrorIcon sx={{ fontSize: 16, color: 'error.main', mt: 0.2 }} />
              ) : (
                <CheckCircle sx={{ fontSize: 16, color: 'primary.main', mt: 0.2 }} />
              )}
              <Box flex={1}>
                <Typography variant="caption" fontWeight="600" color={reminder.overdue ? 'error.main' : 'text.primary'}>
                  {reminder.label}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {formatDate(reminder.date)}
                </Typography>
              </Box>
            </ReminderItem>
          ))}

          <Button
            size="small"
            sx={{ textTransform: 'none', fontSize: '0.7rem', mt: 1 }}
          >
            View All
          </Button>
        </SectionCard>
      )}
    </SidebarContainer>
  );
};

export default LeftSidebar;
