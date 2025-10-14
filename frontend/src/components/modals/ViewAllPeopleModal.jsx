import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';

/**
 * ViewAllPeopleModal - Popup to view/edit all 6 person slots for a role
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {string} roleName - Role name (e.g., "Buyer", "Seller")
 * @param {Array} people - Array of person objects (0-6)
 * @param {Object} color - Color scheme { primary, secondary }
 * @param {Function} onPersonClick - Handler for clicking a person to edit
 * @param {Function} onAddPerson - Handler for adding a new person
 * @param {Function} onRemovePerson - Handler for removing a person
 * @param {Function} getInitials - Helper to get initials
 * @param {Function} truncateName - Helper to truncate names
 */
const ViewAllPeopleModal = ({
  open,
  onClose,
  roleName,
  people,
  color,
  onPersonClick,
  onAddPerson,
  onRemovePerson,
  getInitials,
  truncateName,
}) => {
  const theme = useTheme();

  // Render filled slot
  const renderPersonSlot = (person, index) => (
    <Box
      key={`slot-${index}`}
      onClick={() => onPersonClick && onPersonClick(person, index)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        p: 2,
        borderRadius: 2,
        border: `2px solid ${alpha(color.primary, 0.2)}`,
        background: alpha(color.primary, 0.02),
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(color.primary, 0.08),
          borderColor: alpha(color.primary, 0.4),
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          fontWeight: 700,
          fontSize: '1.2rem',
        }}
      >
        {getInitials(person.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: color.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
          }}
        >
          {roleName} {index + 1}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: theme.palette.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={person.name}
        >
          {person.name}
        </Typography>
        {person.company && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: theme.palette.text.secondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {person.company}
          </Typography>
        )}
      </Box>
      {onRemovePerson && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemovePerson(index);
          }}
          sx={{ width: 32, height: 32, color: 'error.main' }}
        >
          <Remove sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );

  // Render empty slot
  const renderEmptySlot = (index) => (
    <Box
      key={`empty-slot-${index}`}
      onClick={onAddPerson}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        cursor: 'pointer',
        p: 2,
        borderRadius: 2,
        border: `2px dashed ${alpha(color.primary, 0.3)}`,
        background: alpha(color.primary, 0.02),
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(color.primary, 0.05),
          borderColor: alpha(color.primary, 0.5),
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          width: 36,
          height: 36,
          backgroundColor: alpha(color.primary, 0.1),
          color: color.primary,
          '&:hover': {
            backgroundColor: alpha(color.primary, 0.2),
          },
        }}
      >
        <Add sx={{ fontSize: 20 }} />
      </IconButton>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: alpha(color.primary, 0.7),
        }}
      >
        Add {roleName} {index + 1}
      </Typography>
    </Box>
  );

  // Create 6 slots
  const slots = [];
  for (let i = 0; i < 6; i++) {
    if (i < people.length) {
      slots.push(renderPersonSlot(people[i], i));
    } else {
      slots.push(renderEmptySlot(i));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: color.primary }}>
          All {roleName}s
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {slots}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAllPeopleModal;
