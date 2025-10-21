import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Checkbox, IconButton, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Styled Components
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 288,
  backgroundColor: 'white',
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflowY: 'auto',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    display: 'none', // Hide on smaller screens
  },
}));

const WidgetCard = styled(Paper)(({ gradient }) => ({
  background: gradient || 'linear-gradient(to bottom right, #faf5ff, #ede9fe)',
  borderRadius: 12,
  padding: 20,
  border: gradient?.includes('purple')
    ? '1px solid #e9d5ff'
    : gradient?.includes('yellow')
    ? '1px solid #fde68a'
    : '1px solid #bfdbfe',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
}));

const WidgetHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
}));

const IconCircle = styled(Box)(({ gradient }) => ({
  width: 32,
  height: 32,
  background: gradient || 'linear-gradient(to bottom right, #a855f7, #3b82f6)',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.125rem',
}));

const ComingSoonButton = styled(Button)(({ theme }) => ({
  width: '100%',
  background: 'linear-gradient(to right, #a855f7, #3b82f6)',
  color: 'white',
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1),
  borderRadius: 8,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  '&:hover': {
    background: 'linear-gradient(to right, #9333ea, #2563eb)',
  },
}));

const NotesTextarea = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderColor: '#fde68a',
    borderRadius: 8,
    fontSize: '0.875rem',
    '&:hover fieldset': {
      borderColor: '#fcd34d',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f59e0b',
      borderWidth: 2,
    },
  },
}));

const ReminderItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
}));

const AddReminderButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  color: '#3b82f6',
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 1),
  justifyContent: 'flex-start',
  '&:hover': {
    backgroundColor: '#eff6ff',
  },
}));

const EscrowLeftSidebar = ({
  escrowId,
  notes = '',
  onNotesChange,
  reminders = [],
  onReminderToggle,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [newReminderText, setNewReminderText] = useState('');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const handleAddReminder = () => {
    if (newReminderText.trim()) {
      onAddReminder?.(newReminderText.trim());
      setNewReminderText('');
      setIsAddingReminder(false);
    }
  };

  return (
    <SidebarContainer>
      {/* AI Assistant Card */}
      <WidgetCard gradient="linear-gradient(to bottom right, #faf5ff, #dbeafe)">
        <WidgetHeader>
          <IconCircle gradient="linear-gradient(to bottom right, #a855f7, #3b82f6)">
            🤖
          </IconCircle>
          <Typography fontWeight={600} color="text.primary">
            AI Assistant
          </Typography>
        </WidgetHeader>
        <Typography variant="body2" color="text.secondary" mb={1.5} lineHeight={1.5}>
          Your AI-powered escrow assistant will help automate tasks and provide insights.
        </Typography>
        <ComingSoonButton>
          Coming Soon
        </ComingSoonButton>
      </WidgetCard>

      {/* Quick Notes Card */}
      <WidgetCard gradient="linear-gradient(to bottom right, #fffbeb, #fef3c7)">
        <WidgetHeader>
          <IconCircle gradient="linear-gradient(to bottom right, #f59e0b, #eab308)">
            📝
          </IconCircle>
          <Typography fontWeight={600} color="text.primary">
            Quick Notes
          </Typography>
        </WidgetHeader>
        <NotesTextarea
          multiline
          rows={4}
          placeholder="Add notes about this escrow..."
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          variant="outlined"
        />
      </WidgetCard>

      {/* Reminders Card */}
      <WidgetCard gradient="linear-gradient(to bottom right, #eff6ff, #dbeafe)">
        <WidgetHeader>
          <IconCircle gradient="linear-gradient(to bottom right, #3b82f6, #2563eb)">
            🔔
          </IconCircle>
          <Typography fontWeight={600} color="text.primary">
            Reminders
          </Typography>
        </WidgetHeader>

        <Box display="flex" flexDirection="column" gap={1}>
          {reminders.map((reminder, index) => (
            <ReminderItem key={reminder.id || index}>
              <Checkbox
                size="small"
                checked={reminder.completed || false}
                onChange={() => onReminderToggle?.(reminder.id || index)}
                sx={{ padding: 0, marginTop: '2px' }}
              />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  textDecoration: reminder.completed ? 'line-through' : 'none',
                  color: reminder.completed ? 'text.disabled' : 'text.primary',
                }}
              >
                {reminder.text}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onDeleteReminder?.(reminder.id || index)}
                sx={{ padding: 0.5 }}
              >
                <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
            </ReminderItem>
          ))}

          {isAddingReminder ? (
            <Box display="flex" gap={1} mt={1}>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder="Enter reminder..."
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddReminder();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={handleAddReminder}
                sx={{ minWidth: 60 }}
              >
                Add
              </Button>
            </Box>
          ) : (
            <AddReminderButton
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setIsAddingReminder(true)}
            >
              Add Reminder
            </AddReminderButton>
          )}
        </Box>
      </WidgetCard>
    </SidebarContainer>
  );
};

export default EscrowLeftSidebar;
